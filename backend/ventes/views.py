from io import BytesIO

from django.db.models import Q
from django.utils.dateparse import parse_date
from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.models import Structure
from structures.permissions import (
    assert_caissier_works_in_structure,
    assert_gestionnaire_owns_structure,
    assert_proprietaire_owns_structure,
    get_user_structure,
)
from utilisateurs.decorators import (
    caissier_ou_proprietaire_required,
    caissier_required,
    gestionnaire_required,
    proprietaire_required,
    responsable_structure_required,
)

from .models import EtatVente, Facture, OperationCaisse, RetourCaisse, Vente
from .receipts import generer_reçu_pdf
from .serializers import (
    AnnulationSerializer,
    LigneVenteInputSerializer,
    OperationCaisseSerializer,
    PaiementCreateSerializer,
    RetourCaisseSerializer,
    RetourCreateSerializer,
    VenteAvecFactureSerializer,
    VenteSerializer,
)
from .services import VenteErreur, VenteService


def _get_vente(pk):
    try:
        return (
            Vente.objects.select_related(
                "structure",
                "prepare_par",
                "paiement__encaisse_par",
                "facture",
            )
            .prefetch_related(
                "lignes__medicament",
                "facture__impressions__imprime_par",
            )
            .get(id=pk)
        )
    except Vente.DoesNotExist:
        return None


def _erreur_metier(e):
    return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


def _assert_consultation_caisse(user, structure_id):
    """Autorise le caissier (actif) et le proprietaire (lecture seule)."""
    if user.role == "CAISSIER":
        assert_caissier_works_in_structure(user, structure_id)
    else:
        assert_proprietaire_owns_structure(user, structure_id)


def _get_structure_caisse(request):
    """Structure consultee dans la caisse.

    Le caissier travaille sur sa structure active. Le proprietaire doit
    fournir structure_id pour superviser l'une de ses pharmacies.
    """
    if request.user.role == "PROPRIETAIRE":
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return None, Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_proprietaire_owns_structure(request.user, structure_id)
        return Structure.objects.get(id=structure_id), None

    structure = get_user_structure(request.user)
    if not structure:
        return None, Response(
            {"detail": "Aucune structure associÃ©e Ã  votre compte."},
            status=status.HTTP_404_NOT_FOUND,
        )
    assert_caissier_works_in_structure(request.user, structure.id)
    return structure, None


def _filtre_recherche(queryset, recherche):
    """Recherche par numéro de vente, numéro de facture, client, téléphone."""
    if not recherche:
        return queryset
    return queryset.filter(
        Q(numero__icontains=recherche)
        | Q(facture__numero__icontains=recherche)
        | Q(nom_client__icontains=recherche)
        | Q(telephone_client__icontains=recherche)
    )


def _filtre_date_paiement(queryset, date_paiement):
    """Filtre les ventes payees sur la date effective de validation."""
    if not date_paiement:
        return queryset
    date = parse_date(date_paiement)
    if not date:
        return queryset.none()
    return queryset.filter(validee_le__date=date)


# ---------------------------------------------------------------------------
# Gestionnaire — préparation de la vente
# ---------------------------------------------------------------------------


class CreerVenteView(APIView):
    """Crée automatiquement une nouvelle vente à l'ouverture du module."""

    @gestionnaire_required
    def post(self, request):
        structure_id = request.data.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        vente = VenteService.creer_vente(
            structure=structure,
            gestionnaire=request.user,
            adresse_ip=VenteService._adresse_ip(request),
        )
        return Response(
            VenteSerializer(vente).data,
            status=status.HTTP_201_CREATED,
        )


class VentePreparationView(APIView):
    """Retourne la vente en préparation du gestionnaire (si elle existe)."""

    @gestionnaire_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_gestionnaire_owns_structure(request.user, structure_id)

        vente = (
            Vente.objects.select_related("prepare_par")
            .prefetch_related("lignes__medicament")
            .filter(
                structure_id=structure_id,
                prepare_par=request.user,
                etat=EtatVente.EN_PREPARATION,
            )
            .first()
        )
        if not vente:
            return Response(
                {"detail": "Aucune vente en préparation."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(VenteSerializer(vente).data)


class AjouterLigneVenteView(APIView):

    @gestionnaire_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_gestionnaire_owns_structure(request.user, vente.structure_id)

        serializer = LigneVenteInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vente = VenteService.ajouter_ligne(
                vente=vente,
                medicament_id=serializer.validated_data["medicament_id"],
                quantite=serializer.validated_data["quantite"],
            )[0]
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(VenteSerializer(vente).data)


class ModifierLigneVenteView(APIView):

    @gestionnaire_required
    def patch(self, request, pk, ligne_id):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_gestionnaire_owns_structure(request.user, vente.structure_id)

        serializer = LigneVenteInputSerializer(
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)

        try:
            vente = VenteService.modifier_ligne(
                vente=vente,
                ligne_id=ligne_id,
                quantite=serializer.validated_data.get(
                    "quantite",
                    request.data.get("quantite"),
                ),
            )[0]
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(VenteSerializer(vente).data)


class SupprimerLigneVenteView(APIView):

    @gestionnaire_required
    def delete(self, request, pk, ligne_id):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_gestionnaire_owns_structure(request.user, vente.structure_id)

        try:
            vente = VenteService.supprimer_ligne(vente=vente, ligne_id=ligne_id)
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(VenteSerializer(vente).data)


class EnvoyerVenteCaisseView(APIView):

    @gestionnaire_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_gestionnaire_owns_structure(request.user, vente.structure_id)

        try:
            vente = VenteService.envoyer_a_la_caisse(
                vente,
                adresse_ip=VenteService._adresse_ip(request),
                nom_client=request.data.get("nom_client"),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(
            {
                "message": "Vente envoyée à la caisse.",
                "data": VenteSerializer(vente).data,
            }
        )


class AnnulerVenteView(APIView):
    """Annulation d'une vente encore en préparation par le gestionnaire."""

    @gestionnaire_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_gestionnaire_owns_structure(request.user, vente.structure_id)

        serializer = AnnulationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vente = VenteService.annuler_vente(
                vente=vente,
                par=request.user,
                motif=serializer.validated_data.get("motif", ""),
                adresse_ip=VenteService._adresse_ip(request),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(
            {
                "message": "Vente annulée.",
                "data": VenteSerializer(vente).data,
            }
        )


class HistoriqueVentesView(APIView):
    """Historique complet des ventes d'une structure (traçabilité)."""

    @responsable_structure_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_gestionnaire_owns_structure(request.user, structure_id)

        ventes = (
            Vente.objects.filter(structure_id=structure_id)
            .select_related("prepare_par", "paiement__encaisse_par", "facture")
            .prefetch_related("lignes__medicament", "facture__impressions")
        )
        return Response(VenteSerializer(ventes, many=True).data)


class VenteStatistiquesView(APIView):
    """Indicateurs financiers et opérationnels.

    Réservés exclusivement au propriétaire (règle métier du module Caisse) :
    le gestionnaire et le caissier ne peuvent consulter ni le chiffre
    d'affaires, ni les recettes, ni les marges, ni les bénéfices.
    """

    @proprietaire_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_proprietaire_owns_structure(request.user, structure_id)

        return Response(VenteService.statistiques(structure_id))


# ---------------------------------------------------------------------------
# Caissier — encaissement
# ---------------------------------------------------------------------------


class VentesCaisseAttenteView(APIView):
    """Ventes transmises, en cours ou expirées, avec recherche et filtres.

    Le montant total n'est jamais requis dans cette liste (masqué à l'écran).
    Consultation autorisée au caissier et au propriétaire.
    """

    @caissier_ou_proprietaire_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        statut = request.query_params.get("statut", "toutes")
        etats_par_statut = {
            "toutes": (
                EtatVente.EN_ATTENTE_PAIEMENT,
                EtatVente.EN_COURS,
                EtatVente.EXPIREE,
            ),
            "attente": (EtatVente.EN_ATTENTE_PAIEMENT,),
            "cours": (EtatVente.EN_COURS,),
            "expirees": (EtatVente.EXPIREE,),
        }
        etats = etats_par_statut.get(statut, etats_par_statut["toutes"])

        ventes = (
            _filtre_recherche(
                Vente.objects.filter(
                    structure=structure,
                    etat__in=etats,
                ),
                request.query_params.get("recherche", "").strip(),
            )
            .select_related("prepare_par")
            .prefetch_related("lignes__medicament")
            .order_by("cree_le")
        )
        return Response(
            {
                "structure": {
                    "id": str(structure.id),
                    "nom": structure.nom,
                    "adresse": structure.adresse,
                    "telephone": structure.telephone,
                },
                "results": VenteSerializer(ventes, many=True).data,
            }
        )


class OuvrirVenteCaisseView(APIView):
    """Le caissier ouvre une vente : elle passe à l'état « En cours »."""

    @caissier_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, vente.structure_id)

        try:
            vente = VenteService.ouvrir_vente_caisse(
                vente,
                caissier=request.user,
                adresse_ip=VenteService._adresse_ip(request),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(
            {
                "message": "Vente ouverte.",
                "data": VenteSerializer(vente).data,
            }
        )


class VenteCaisseDetailView(APIView):

    @caissier_ou_proprietaire_required
    def get(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        _assert_consultation_caisse(request.user, vente.structure_id)
        return Response(VenteSerializer(vente).data)


class ValiderPaiementView(APIView):

    @caissier_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, vente.structure_id)

        serializer = PaiementCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vente, paiement, facture = VenteService.valider_paiement(
                vente=vente,
                caissier=request.user,
                mode=serializer.validated_data["mode"],
                adresse_ip=VenteService._adresse_ip(request),
                nom_client=request.data.get("nom_client"),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(
            {
                "message": "Paiement validé avec succès.",
                "vente": VenteAvecFactureSerializer(vente).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AnnulerVenteCaisseView(APIView):

    @caissier_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, vente.structure_id)

        serializer = AnnulationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            vente = VenteService.annuler_vente(
                vente=vente,
                par=request.user,
                motif=serializer.validated_data.get("motif", ""),
                adresse_ip=VenteService._adresse_ip(request),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        vente = _get_vente(vente.id)
        return Response(
            {
                "message": "Vente annulée.",
                "data": VenteSerializer(vente).data,
            }
        )


class PaiementsRealisesView(APIView):
    """Historique des ventes encaissées (consultation, reçu, réimpression)."""

    @caissier_ou_proprietaire_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        ventes = (
            _filtre_date_paiement(
                _filtre_recherche(
                    Vente.objects.filter(
                        structure=structure,
                        etat=EtatVente.PAYEE,
                    ),
                    request.query_params.get("recherche", "").strip(),
                ),
                request.query_params.get("date_paiement", "").strip(),
            )
            .select_related("prepare_par", "paiement__encaisse_par", "facture")
            .prefetch_related("lignes__medicament")
            .order_by("-validee_le")
        )
        return Response(VenteSerializer(ventes, many=True).data)


class RetoursCaisseView(APIView):
    """Liste et création des retours en caisse."""

    @caissier_ou_proprietaire_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        retours = (
            RetourCaisse.objects.filter(structure=structure)
            .select_related("vente", "effectue_par")
            .prefetch_related("lignes", "vente__facture")
            .order_by("-effectue_le")
        )
        return Response(RetourCaisseSerializer(retours, many=True).data)

    @caissier_required
    def post(self, request):
        structure = get_user_structure(request.user)
        if not structure:
            return Response(
                {"detail": "Aucune structure associée à votre compte."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, structure.id)

        serializer = RetourCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        vente = _get_vente(data["vente_id"])
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, vente.structure_id)

        try:
            retour = VenteService.effectuer_retour(
                vente=vente,
                caissier=request.user,
                motif=data["motif"],
                items=data["items"],
                commentaire=data.get("commentaire", ""),
                adresse_ip=VenteService._adresse_ip(request),
            )
        except VenteErreur as e:
            return _erreur_metier(e)

        retour = (
            RetourCaisse.objects.select_related("vente", "effectue_par")
            .prefetch_related("lignes", "vente__facture")
            .get(id=retour.id)
        )
        return Response(
            {
                "message": "Retour en caisse enregistré.",
                "data": RetourCaisseSerializer(retour).data,
            },
            status=status.HTTP_201_CREATED,
        )


class OperationCaisseHistoriqueView(APIView):
    """Journal complet des opérations réalisées (traçabilité)."""

    @caissier_ou_proprietaire_required
    def get(self, request):
        structure, error = _get_structure_caisse(request)
        if error:
            return error

        operations = (
            OperationCaisse.objects.filter(structure=structure)
            .select_related("utilisateur", "vente")
            .order_by("-cree_le")
        )
        return Response(OperationCaisseSerializer(operations, many=True).data)


class FactureDetailView(APIView):

    @caissier_ou_proprietaire_required
    def get(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        _assert_consultation_caisse(request.user, vente.structure_id)

        try:
            facture = vente.facture
        except Facture.DoesNotExist:
            return Response(
                {"detail": "Aucune facture pour cette vente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(VenteAvecFactureSerializer(vente).data)


class ImprimerFactureView(APIView):
    """Enregistre une impression/réimpression de la facture."""

    @caissier_required
    def post(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        assert_caissier_works_in_structure(request.user, vente.structure_id)

        try:
            facture = vente.facture
        except Facture.DoesNotExist:
            return Response(
                {"detail": "Aucune facture pour cette vente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        VenteService.imprimer_facture(
            facture=facture,
            utilisateur=request.user,
            adresse_ip=VenteService._adresse_ip(request),
        )

        return Response(
            {
                "message": "Impression enregistrée.",
                "total_impressions": VenteService.total_impressions(facture),
                "facture": {
                    "id": str(facture.id),
                    "numero": facture.numero,
                },
            }
        )


class ReceptionPDFView(APIView):
    """Télécharge le reçu PDF d'une vente payée."""

    @caissier_ou_proprietaire_required
    def get(self, request, pk):
        vente = _get_vente(pk)
        if not vente:
            return Response(
                {"detail": "Vente introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )
        _assert_consultation_caisse(request.user, vente.structure_id)

        try:
            facture = vente.facture
        except Facture.DoesNotExist:
            return Response(
                {"detail": "Aucune facture pour cette vente."},
                status=status.HTTP_404_NOT_FOUND,
            )

        pdf = BytesIO(generer_reçu_pdf(vente))
        nom = f"recu_{facture.numero}.pdf"
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=nom,
            content_type="application/pdf",
        )
