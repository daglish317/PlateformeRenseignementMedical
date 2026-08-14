"""Vues du module Historique (journal de traçabilité en lecture seule).

Permissions :
- Gestionnaire : consulter, rechercher, filtrer et consulter les détails.
- Propriétaire : accès complet en lecture + export PDF/Excel.
- Caissier : aucun accès.

Aucun événement ne peut être modifié, supprimé ou renommé.
"""

from datetime import date, timedelta
from io import BytesIO

from django.db.models import Q
from django.http import FileResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.models import Structure
from structures.permissions import assert_operational_access
from structures.permission_registry import ActionPermission, ModuleOperationnel
from utilisateurs.decorators import operational_member_required

from .exports import generer_historique_excel, generer_historique_pdf
from .models import EvenementHistorique, TypeEvenementHistorique
from .serializers import EvenementHistoriqueSerializer


def _evenements_structure(structure_id):
    return EvenementHistorique.objects.filter(
        structure_id=structure_id,
    ).select_related("structure", "utilisateur")


def _periode_filtre(periode, date_debut, date_fin):
    """Applique le filtre de période choisi.

    Retourne une condition Q et un libellé de période (pour l'export).
    """
    aujourdhui = timezone.localdate()

    if periode == "aujourdhui":
        return (
            Q(cree_le__date=aujourdhui),
            f"Aujourd'hui — {aujourdhui:%d/%m/%Y}",
        )

    if periode == "semaine":
        debut = aujourdhui - timedelta(days=aujourdhui.weekday())
        return (
            Q(cree_le__date__gte=debut),
            f"Cette semaine — depuis le {debut:%d/%m/%Y}",
        )

    if periode == "mois":
        debut = aujourdhui.replace(day=1)
        return (
            Q(cree_le__date__gte=debut),
            f"Ce mois — depuis le {debut:%d/%m/%Y}",
        )

    if periode == "personnalisee":
        if not date_debut and not date_fin:
            return Q(), "Période personnalisée (complète)"

        conditions = Q()
        libelle = "Période personnalisée"
        if date_debut:
            conditions &= Q(cree_le__date__gte=date_debut)
            libelle += f" — du {date_debut:%d/%m/%Y}"
        if date_fin:
            conditions &= Q(cree_le__date__lte=date_fin)
            libelle += f" au {date_fin:%d/%m/%Y}"
        return conditions, libelle

    return Q(), "Toute la période"


def _appliquer_filtres(queryset, params):
    """Applique recherche, type d'événement et période."""
    recherche = (params.get("recherche") or "").strip()
    if recherche:
        queryset = queryset.filter(texte_recherche__icontains=recherche)

    type_evenement = (params.get("type") or "").strip().upper()
    if type_evenement in TypeEvenementHistorique.values:
        queryset = queryset.filter(type=type_evenement)

    periode = (params.get("periode") or "").strip().lower()
    date_debut = date_fin = None
    for nom in ("date_debut", "date_fin"):
        brut = (params.get(nom) or "").strip()
        if brut:
            try:
                valeur = date.fromisoformat(brut)
            except ValueError:
                return None, "Période invalide", None
            if nom == "date_debut":
                date_debut = valeur
            else:
                date_fin = valeur

    condition, libelle = _periode_filtre(periode, date_debut, date_fin)
    queryset = queryset.filter(condition)
    return queryset, None, libelle


class ResumeHistoriqueView(APIView):
    """Zone 1 — Résumé : indicateurs rapides de l'activité."""

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
            ModuleOperationnel.HISTORIQUE,
            ActionPermission.CONSULTER,
        )

        aujourdhui = timezone.localdate()
        evenements = EvenementHistorique.objects.filter(structure_id=structure_id)

        resume = {
            "evenements_aujourdhui": evenements.filter(
                cree_le__date=aujourdhui,
            ).count(),
            "approvisionnements": evenements.filter(
                type=TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
            ).count(),
            "retours_caisse": evenements.filter(
                type=TypeEvenementHistorique.CAISSE_RETOUR,
            ).count(),
            "inventaires_generes": evenements.filter(
                type=TypeEvenementHistorique.INVENTAIRE_GENERE,
            ).count(),
        }
        return Response(resume)


class ListeHistoriqueView(APIView):
    """Zone 4 — Liste chronologique des événements (du plus récent au plus ancien)."""

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
            ModuleOperationnel.HISTORIQUE,
            ActionPermission.CONSULTER,
        )

        queryset = _evenements_structure(structure_id)
        queryset, erreur, _ = _appliquer_filtres(queryset, request.query_params)
        if erreur:
            return Response(
                {"detail": erreur},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            EvenementHistoriqueSerializer(queryset, many=True).data
        )


class DetailEvenementHistoriqueView(APIView):
    """Zone fiche — Consultation des détails complets d'un événement."""

    @operational_member_required
    def get(self, request, pk):
        try:
            evenement = EvenementHistorique.objects.select_related(
                "structure",
                "utilisateur",
            ).get(id=pk)
        except EvenementHistorique.DoesNotExist:
            return Response(
                {"detail": "Événement introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            evenement.structure_id,
            ModuleOperationnel.HISTORIQUE,
            ActionPermission.CONSULTER,
        )

        return Response(EvenementHistoriqueSerializer(evenement).data)


class HistoriquePDFView(APIView):
    """Export PDF de l'historique (réservé au propriétaire)."""

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
            ModuleOperationnel.HISTORIQUE,
            ActionPermission.EXPORTER,
        )
        structure = Structure.objects.get(id=structure_id)

        queryset, erreur, libelle = _appliquer_filtres(
            _evenements_structure(structure_id),
            request.query_params,
        )
        if erreur:
            return Response(
                {"detail": erreur},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pdf = BytesIO(generer_historique_pdf(structure, queryset, periode=libelle))
        nom = f"historique_{structure.nom}.pdf".replace(" ", "_")
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=nom,
            content_type="application/pdf",
        )


class HistoriqueExcelView(APIView):
    """Export Excel de l'historique (réservé au propriétaire)."""

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
            ModuleOperationnel.HISTORIQUE,
            ActionPermission.EXPORTER,
        )
        structure = Structure.objects.get(id=structure_id)

        queryset, erreur, libelle = _appliquer_filtres(
            _evenements_structure(structure_id),
            request.query_params,
        )
        if erreur:
            return Response(
                {"detail": erreur},
                status=status.HTTP_400_BAD_REQUEST,
            )

        excel = BytesIO(generer_historique_excel(structure, queryset, periode=libelle))
        nom = f"historique_{structure.nom}.xlsx".replace(" ", "_")
        return FileResponse(
            excel,
            as_attachment=True,
            filename=nom,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )
