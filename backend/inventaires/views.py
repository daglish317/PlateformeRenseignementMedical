from io import BytesIO

from django.db.models import Count, Q
from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.models import Structure
from structures.permissions import assert_gestionnaire_owns_structure
from utilisateurs.decorators import (
    gestionnaire_required,
    responsable_structure_required,
)

from .exports import generer_inventaire_excel, generer_inventaire_pdf
from .models import Inventaire, StatutInventaire
from .serializers import InventaireDetailSerializer, InventaireListeSerializer
from .services import InventaireService

_STATUT_PAR_LIBELLE = {
    "disponible": StatutInventaire.DISPONIBLE,
    "stock faible": StatutInventaire.STOCK_FAIBLE,
    "stock-faible": StatutInventaire.STOCK_FAIBLE,
    "rupture": StatutInventaire.RUPTURE,
}


def _get_inventaire(pk):
    try:
        return Inventaire.objects.select_related(
            "structure",
            "cree_par",
        ).get(id=pk)
    except Inventaire.DoesNotExist:
        return None


class GenererInventaireView(APIView):
    """Génère un inventaire (réservé au gestionnaire de la structure)."""

    @gestionnaire_required
    def post(self, request):
        structure_id = request.data.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        inventaire = InventaireService.generer(
            structure=structure,
            utilisateur=request.user,
        )
        return Response(
            InventaireDetailSerializer(inventaire).data,
            status=status.HTTP_201_CREATED,
        )


class ListeInventairesView(APIView):
    """Historique des inventaires d'une structure.

    Accessible au gestionnaire (production) et au propriétaire (supervision).
    """

    @responsable_structure_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        assert_gestionnaire_owns_structure(request.user, structure_id)

        inventaires = Inventaire.objects.filter(
            structure_id=structure_id,
        ).select_related("structure", "cree_par").annotate(
            _nb_total=Count("lignes__id"),
            _nb_disponibles=Count(
                "lignes__id",
                filter=Q(lignes__statut=StatutInventaire.DISPONIBLE),
            ),
            _nb_stock_faible=Count(
                "lignes__id",
                filter=Q(lignes__statut=StatutInventaire.STOCK_FAIBLE),
            ),
            _nb_ruptures=Count(
                "lignes__id",
                filter=Q(lignes__statut=StatutInventaire.RUPTURE),
            ),
        )
        return Response(
            InventaireListeSerializer(inventaires, many=True).data
        )


class DetailInventaireView(APIView):
    """Consultation d'un inventaire avec recherche et filtres."""

    @responsable_structure_required
    def get(self, request, pk):
        inventaire = _get_inventaire(pk)
        if not inventaire:
            return Response(
                {"detail": "Inventaire introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, inventaire.structure_id)

        lignes = inventaire.lignes.all()

        recherche = (request.query_params.get("recherche") or "").strip()
        if recherche:
            conditions = (
                Q(nom__icontains=recherche)
                | Q(forme_pharmaceutique__icontains=recherche)
            )
            statut_code = _STATUT_PAR_LIBELLE.get(recherche.lower())
            if statut_code:
                conditions |= Q(statut=statut_code)
            lignes = lignes.filter(conditions)

        statut = (request.query_params.get("statut") or "").strip().upper()
        if statut in StatutInventaire.values:
            lignes = lignes.filter(statut=statut)

        return Response(
            InventaireDetailSerializer(
                inventaire,
                context={"lignes": lignes},
            ).data
        )


class InventairePDFView(APIView):
    """Télécharge l'export PDF d'un inventaire."""

    @responsable_structure_required
    def get(self, request, pk):
        inventaire = _get_inventaire(pk)
        if not inventaire:
            return Response(
                {"detail": "Inventaire introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, inventaire.structure_id)

        pdf = BytesIO(generer_inventaire_pdf(inventaire))
        nom = f"inventaire_{inventaire.numero}.pdf"
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=nom,
            content_type="application/pdf",
        )


class InventaireExcelView(APIView):
    """Télécharge l'export Excel d'un inventaire."""

    @responsable_structure_required
    def get(self, request, pk):
        inventaire = _get_inventaire(pk)
        if not inventaire:
            return Response(
                {"detail": "Inventaire introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, inventaire.structure_id)

        excel = BytesIO(generer_inventaire_excel(inventaire))
        nom = f"inventaire_{inventaire.numero}.xlsx"
        return FileResponse(
            excel,
            as_attachment=True,
            filename=nom,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )
