"""Module Facture — production, consultation, recherche et impression des factures.

Une facture est toujours rattachée à une vente finalisée (payée) et récupère
ses informations depuis la vente : les montants ne sont jamais recalculés par
le client. La création d'une facture ne modifie jamais le stock.
"""

from io import BytesIO

from django.db.models import Q
from django.http import FileResponse
from django.utils.dateparse import parse_date
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.permissions import assert_operational_access
from structures.permission_registry import ActionPermission, ModuleOperationnel
from utilisateurs.decorators import operational_member_required

from .facture_pdf import generer_facture_pdf
from .models import EtatVente, Facture, Vente
from .serializers import (
    FactureDetailSerializer,
    FactureListSerializer,
    VenteSerializer,
)
from .services import VenteErreur, VenteService
from .views import _get_structure_caisse


def _get_facture(pk):
    try:
        return (
            Facture.objects.select_related(
                "structure",
                "vente__prepare_par",
                "vente__paiement__encaisse_par",
            )
            .prefetch_related("vente__lignes__medicament")
            .get(id=pk)
        )
    except Facture.DoesNotExist:
        return None


class FactureListView(APIView):
    """Liste des factures d'une structure, filtrable et combinable.

    Filtres : recherche (numéro de facture, référence de vente, bénéficiaire),
    bénéficiaire, période (date_debut, date_fin). Les factures liées à une
    vente annulée ou expirée ne sont pas présentées comme des ventes
    définitives.
    """

    @operational_member_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        assert_operational_access(
            request.user,
            structure.id,
            ModuleOperationnel.FACTURE,
            ActionPermission.CONSULTER,
        )

        factures = Facture.objects.filter(
            structure=structure,
            vente__etat=EtatVente.PAYEE,
        )

        recherche = request.query_params.get("recherche", "").strip()
        if recherche:
            factures = factures.filter(
                Q(numero__icontains=recherche)
                | Q(vente__numero__icontains=recherche)
                | Q(beneficiaire__icontains=recherche)
            )

        beneficiaire = request.query_params.get("beneficiaire", "").strip()
        if beneficiaire:
            factures = factures.filter(beneficiaire__icontains=beneficiaire)

        date_debut = request.query_params.get("date_debut", "").strip()
        if date_debut:
            d = parse_date(date_debut)
            if d:
                factures = factures.filter(cree_le__date__gte=d)

        date_fin = request.query_params.get("date_fin", "").strip()
        if date_fin:
            d = parse_date(date_fin)
            if d:
                factures = factures.filter(cree_le__date__lte=d)

        factures = factures.select_related("structure", "vente").order_by(
            "-cree_le"
        )
        return Response(FactureListSerializer(factures, many=True).data)


class VentesEligiblesFactureView(APIView):
    """Ventes finalisées sans facture, éligibles à une génération."""

    @operational_member_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        assert_operational_access(
            request.user,
            structure.id,
            ModuleOperationnel.FACTURE,
            ActionPermission.CREER,
        )

        ventes = Vente.objects.filter(
            structure=structure,
            etat=EtatVente.PAYEE,
            facture__isnull=True,
        )

        recherche = request.query_params.get("recherche", "").strip()
        if recherche:
            ventes = ventes.filter(
                Q(numero__icontains=recherche)
                | Q(nom_client__icontains=recherche)
            )

        ventes = ventes.select_related("prepare_par").prefetch_related(
            "lignes__medicament"
        )
        return Response(VenteSerializer(ventes, many=True).data)


class GenererFactureView(APIView):
    """Génère une facture à partir d'une vente finalisée.

    Le bénéficiaire est obligatoire : il provient de la vente ou est saisi au
    moment de la génération (cas 3 de la spécification).
    """

    @operational_member_required
    def post(self, request):
        vente_id = request.data.get("vente_id")
        if not vente_id:
            return Response(
                {"detail": "vente_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            vente = Vente.objects.get(id=vente_id)
        except Vente.DoesNotExist:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            vente.structure_id,
            ModuleOperationnel.FACTURE,
            ActionPermission.CREER,
        )

        try:
            facture = VenteService.generer_facture(
                vente=vente,
                utilisateur=request.user,
                beneficiaire=request.data.get("beneficiaire", ""),
                adresse_ip=VenteService._adresse_ip(request),
            )
        except VenteErreur as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        facture = _get_facture(facture.id)
        return Response(
            {
                "message": "Facture générée avec succès.",
                "data": FactureDetailSerializer(facture).data,
            },
            status=status.HTTP_201_CREATED,
        )


class FactureDetailModuleView(APIView):
    """Consultation d'une facture dans le module Facture."""

    @operational_member_required
    def get(self, request, pk):
        facture = _get_facture(pk)
        if not facture:
            return Response(
                {"detail": "Facture introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            facture.structure_id,
            ModuleOperationnel.FACTURE,
            ActionPermission.CONSULTER,
        )

        return Response(FactureDetailSerializer(facture).data)


class FacturePDFView(APIView):
    """Télécharge le PDF de la facture et enregistre l'impression."""

    @operational_member_required
    def get(self, request, pk):
        facture = _get_facture(pk)
        if not facture:
            return Response(
                {"detail": "Facture introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_operational_access(
            request.user,
            facture.structure_id,
            ModuleOperationnel.FACTURE,
            ActionPermission.IMPRIMER,
        )

        VenteService.imprimer_facture(
            facture=facture,
            utilisateur=request.user,
            adresse_ip=VenteService._adresse_ip(request),
        )

        pdf = BytesIO(generer_facture_pdf(facture))
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=f"facture_{facture.numero}.pdf",
            content_type="application/pdf",
        )
