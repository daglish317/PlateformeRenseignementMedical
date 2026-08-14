"""Vues du module Alertes (système de surveillance en lecture seule).

Permissions :
- Gestionnaire : consulter les alertes opérationnelles, rechercher,
  filtrer, marquer comme lue et accéder au module concerné. Il ne peut
  ni consulter les alertes de supervision, ni exporter.
- Propriétaire : consulter toutes les alertes, rechercher (y compris par
  utilisateur concerné), filtrer, marquer comme lue, exporter PDF/Excel.
- Caissier : aucun accès.

Aucune alerte ne peut être créée, modifiée ou supprimée par un
utilisateur : les seules écritures autorisées sont le marquage comme
« lue », propre à chaque utilisateur, et la résolution automatique
effectuée par le système.
"""

from io import BytesIO

from django.db.models import Q
from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.models import Structure
from structures.permissions import (
    assert_operational_access,
)
from structures.permission_registry import ActionPermission, ModuleOperationnel
from utilisateurs.decorators import (
    operational_member_required,
)

from .exports import generer_alertes_excel, generer_alertes_pdf
from .models import Alerte, CategorieAlerte, PrioriteAlerte, TypeAlerte
from .serializers import AlerteSerializer
from .services import AlertesService


def _alertes_structure(structure_id, utilisateur):
    """Alertes visibles par l'utilisateur pour la structure donnée.

    Le gestionnaire ne voit que les alertes opérationnelles ; le
    propriétaire voit toutes les alertes.
    """
    queryset = Alerte.objects.filter(structure_id=structure_id).select_related(
        "structure",
        "utilisateur_concerne",
    )
    if utilisateur.role == "GESTIONNAIRE":
        queryset = queryset.filter(categorie=CategorieAlerte.OPERATIONNELLE)
    return queryset


def _appliquer_filtres(queryset, utilisateur, params):
    """Applique recherche, filtre de la zone 3 et recherche utilisateur."""
    recherche = (params.get("recherche") or "").strip()
    if recherche:
        queryset = queryset.filter(texte_recherche__icontains=recherche)

    if utilisateur.role == "PROPRIETAIRE":
        recherche_utilisateur = (
            params.get("recherche_utilisateur") or ""
        ).strip()
        if recherche_utilisateur:
            queryset = queryset.filter(
                Q(utilisateur_concerne__nom__icontains=recherche_utilisateur)
                | Q(texte_recherche__icontains=recherche_utilisateur)
            )

    filtre = (params.get("filtre") or "toutes").strip().lower()
    if filtre == "critiques":
        queryset = queryset.filter(
            priorite=PrioriteAlerte.CRITIQUE,
            est_resolue=False,
        )
    elif filtre == "non_lues":
        queryset = queryset.filter(est_resolue=False).exclude(lu_par=utilisateur)
    elif filtre == "stock_faible":
        queryset = queryset.filter(type=TypeAlerte.STOCK_FAIBLE)
    elif filtre == "rupture":
        queryset = queryset.filter(type=TypeAlerte.RUPTURE_STOCK)
    elif filtre == "supervision":
        queryset = queryset.filter(categorie=CategorieAlerte.SUPERVISION)

    return queryset


def _libelle_filtre(params):
    """Libellé du filtre actif (utilisé pour les exports)."""
    libelles = {
        "critiques": "Critiques",
        "non_lues": "Non lues",
        "stock_faible": "Stock faible",
        "rupture": "Rupture de stock",
        "supervision": "Supervision",
    }
    filtre = (params.get("filtre") or "toutes").strip().lower()
    return libelles.get(filtre, "Toutes")


class ResumeAlertesView(APIView):
    """Zone 1 — Résumé : total, critiques, non lues et résolues."""

    @operational_member_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_operational_access(
            request.user,
            structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.CONSULTER,
        )

        visible = _alertes_structure(structure_id, request.user)
        resume = {
            "total": visible.filter(est_resolue=False).count(),
            "critiques": visible.filter(
                est_resolue=False,
                priorite=PrioriteAlerte.CRITIQUE,
            ).count(),
            "non_lues": visible.filter(est_resolue=False)
            .exclude(lu_par=request.user)
            .count(),
            "resolues": visible.filter(est_resolue=True).count(),
        }
        return Response(resume)


class ListeAlertesView(APIView):
    """Zone 4 — Liste des alertes (du plus récent au plus ancien)."""

    @operational_member_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_operational_access(
            request.user,
            structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.CONSULTER,
        )

        queryset = _appliquer_filtres(
            _alertes_structure(structure_id, request.user),
            request.user,
            request.query_params,
        )

        return Response(
            AlerteSerializer(
                queryset,
                many=True,
                context={"request": request},
            ).data
        )


class DetailAlerteView(APIView):
    """Zone 9 — Consultation complète d'une alerte (aucune modification)."""

    @operational_member_required
    def get(self, request, pk):
        try:
            alerte = Alerte.objects.select_related(
                "structure",
                "utilisateur_concerne",
            ).get(id=pk)
        except Alerte.DoesNotExist:
            return Response(
                {"detail": "Alerte introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            alerte.structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.CONSULTER,
        )

        if (
            request.user.role == "GESTIONNAIRE"
            and alerte.categorie != CategorieAlerte.OPERATIONNELLE
        ):
            return Response(
                {"detail": "Alerte introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            AlerteSerializer(
                alerte,
                context={"request": request},
            ).data
        )


class MarquerLueAlerteView(APIView):
    """Zone 10 — Marquage d'une alerte comme lue (propre à l'utilisateur)."""

    @operational_member_required
    def post(self, request, pk):
        try:
            alerte = Alerte.objects.get(id=pk)
        except Alerte.DoesNotExist:
            return Response(
                {"detail": "Alerte introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            alerte.structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.MODIFIER,
        )

        if (
            request.user.role == "GESTIONNAIRE"
            and alerte.categorie != CategorieAlerte.OPERATIONNELLE
        ):
            return Response(
                {"detail": "Alerte introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        AlertesService.marquer_lue(alerte, request.user)

        return Response(
            AlerteSerializer(
                alerte,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class AlertesPDFView(APIView):
    """Export PDF des alertes (réservé au propriétaire)."""

    @operational_member_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_operational_access(
            request.user,
            structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.EXPORTER,
        )
        structure = Structure.objects.get(id=structure_id)

        queryset = _appliquer_filtres(
            _alertes_structure(structure_id, request.user),
            request.user,
            request.query_params,
        )

        pdf = BytesIO(
            generer_alertes_pdf(
                structure,
                queryset,
                libelle_filtre=_libelle_filtre(request.query_params),
            )
        )
        nom = f"alertes_{structure.nom}.pdf".replace(" ", "_")
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=nom,
            content_type="application/pdf",
        )


class AlertesExcelView(APIView):
    """Export Excel des alertes (réservé au propriétaire)."""

    @operational_member_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_operational_access(
            request.user,
            structure_id,
            ModuleOperationnel.ALERTES,
            ActionPermission.EXPORTER,
        )
        structure = Structure.objects.get(id=structure_id)

        queryset = _appliquer_filtres(
            _alertes_structure(structure_id, request.user),
            request.user,
            request.query_params,
        )

        excel = BytesIO(
            generer_alertes_excel(
                structure,
                queryset,
                libelle_filtre=_libelle_filtre(request.query_params),
            )
        )
        nom = f"alertes_{structure.nom}.xlsx".replace(" ", "_")
        return FileResponse(
            excel,
            as_attachment=True,
            filename=nom,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )
