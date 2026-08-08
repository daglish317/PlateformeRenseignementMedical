from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .serializers_public import StructureMapSerializer
from .models import Structure, Favori, Horaire
from .serializers import (
    StructureCreateSerializer,
    StructureListSerializer,
    StructureAdminListSerializer,
    StructureDetailSerializer,
    StructureValidationSerializer,
    EquipeStructureSerializer,
    FavoriCreateSerializer,
    FavoriSerializer,
    HoraireSerializer,
    HoraireBulkCreateSerializer,
    InviteStructureMemberSerializer,
    ProprietaireStructureCreateSerializer,
    StructureMapSerializer,
    UpdateStructureMemberStatusSerializer,
)

from .services import StructureService, StructureGeoService
from utilisateurs.decorators import (
    admin_required,
    gestionnaire_required,
    proprietaire_required,
    responsable_structure_required,
)
from .permissions import (
    assert_gestionnaire_owns_structure,
    assert_proprietaire_owns_structure,
    get_user_structure,
)
from .models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    StatutStructure,
)
from utilisateurs.services.invitation_service import InvitationService


class CreateStructureView(APIView):

    @responsable_structure_required
    def post(self, request):

        serializer = StructureCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            structure = StructureService.creer_structure(
                gestionnaire=request.user,
                donnees=serializer.validated_data,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "Structure crÃ©Ã©e avec succÃ¨s",
                "data": StructureDetailSerializer(structure).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminListStructuresView(APIView):

    @admin_required
    def get(self, request):
        from django.db.models import Q

        structures = (
            Structure.objects.filter(est_supprimee=False)
            .select_related("gestionnaire")
            .prefetch_related("equipe__utilisateur")
        )

        search = request.query_params.get("search", "").strip()
        if search:
            structures = structures.filter(
                Q(nom__icontains=search) | Q(adresse__icontains=search)
            )

        statut = request.query_params.get("statut")
        if statut:
            structures = structures.filter(statut=statut)

        type_structure = request.query_params.get("type")
        if type_structure:
            structures = structures.filter(type=type_structure)

        ordering = request.query_params.get("ordering", "-date_creation")
        structures = structures.order_by(ordering)

        page = max(int(request.query_params.get("page", 1)), 1)
        page_size = min(int(request.query_params.get("page_size", 20)), 100)
        total = structures.count()
        start = (page - 1) * page_size
        items = structures[start : start + page_size]

        return Response({
            "results": StructureAdminListSerializer(items, many=True).data,
            "page": page,
            "page_size": page_size,
            "total": total,
        })


class StructureDetailView(APIView):

    def get(self, request, pk):

        try:
            structure = Structure.objects.get(id=pk)
        except Structure.DoesNotExist:
            return Response(
                {"message": "Structure introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            StructureDetailSerializer(structure).data
        )

    @responsable_structure_required
    def patch(self, request, pk):
        try:
            assert_gestionnaire_owns_structure(request.user, pk)
            structure = Structure.objects.get(id=pk, est_supprimee=False)
        except Structure.DoesNotExist:
            return Response(
                {"detail": "Structure introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        allowed_fields = {"nom", "adresse", "telephone", "photo"}
        data = {}
        for key in allowed_fields:
            if key in request.data:
                data[key] = request.data[key]

        serializer = StructureCreateSerializer(structure, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(StructureDetailSerializer(structure).data)


class ValidateStructureView(APIView):

    @admin_required
    def patch(self, request, pk):

        try:
            structure = Structure.objects.get(id=pk)

        except Structure.DoesNotExist:

            return Response(
                {
                    "message": "Structure introuvable"
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = StructureValidationSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        action = serializer.validated_data["action"]

        try:

            if action == "APPROVE":

                structure = StructureService.valider_structure(
                    structure=structure,
                    administrateur=request.user,
                )

                message = "Structure validÃ©e avec succÃ¨s."

            else:

                structure = StructureService.refuser_structure(
                    structure=structure,
                    administrateur=request.user,
                    motif=serializer.validated_data["motif"],
                )

                message = "Structure refusÃ©e avec succÃ¨s."

        except ValueError as e:

            return Response(
                {
                    "message": str(e)
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": message,
                "data": StructureDetailSerializer(structure).data,
            },
            status=status.HTTP_200_OK,
        )

class StructuresProchesView(APIView):

    def get(self, request):

        lat = request.query_params.get("lat")
        lon = request.query_params.get("lon")
        rayon = request.query_params.get("rayon", 10)

        if not lat or not lon:
            return Response(
                {"detail": "lat et lon requis"},
                status=400
            )

        resultats = StructureGeoService.structures_proches(
            float(lat),
            float(lon),
            float(rayon)
        )

        data = []

        for r in resultats:
            data.append({
                "structure": StructureMapSerializer(r["structure"]).data,
                "distance_km": r["distance"]
            })

        return Response(data)


class AddFavoriView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = FavoriCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        structure_id = serializer.validated_data["structure_id"]

        try:
            structure = Structure.objects.get(
                id=structure_id,
                statut="ACTIVE",
                est_supprimee=False,
            )
        except Structure.DoesNotExist:
            return Response(
                {"detail": "Structure introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        favori, created = Favori.objects.get_or_create(
            utilisateur=request.user,
            structure=structure,
        )

        if not created:
            return Response(
                {"detail": "DÃ©jÃ  dans vos favoris"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "AjoutÃ© aux favoris", "data": FavoriSerializer(favori).data},
            status=status.HTTP_201_CREATED,
        )


class RemoveFavoriView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request, structure_id):

        try:
            favori = Favori.objects.get(
                utilisateur=request.user,
                structure_id=structure_id,
            )
        except Favori.DoesNotExist:
            return Response(
                {"detail": "Favori introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        favori.delete()
        return Response(
            {"message": "RetirÃ© des favoris"},
            status=status.HTTP_200_OK,
        )


class ListFavorisView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        favoris = Favori.objects.filter(
            utilisateur=request.user,
        ).select_related("structure").order_by("-date_ajout")

        page = max(int(request.query_params.get("page", 1)), 1)
        page_size = min(int(request.query_params.get("page_size", 20)), 100)
        total = favoris.count()
        start = (page - 1) * page_size
        items = favoris[start : start + page_size]

        return Response({
            "results": FavoriSerializer(items, many=True).data,
            "page": page,
            "page_size": page_size,
            "total": total,
        })


class CheckFavoriView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, structure_id):

        is_favori = Favori.objects.filter(
            utilisateur=request.user,
            structure_id=structure_id,
        ).exists()

        return Response({"is_favori": is_favori})


class ListHorairesView(APIView):

    def get(self, request, structure_id):

        horaires = Horaire.objects.filter(
            structure_id=structure_id,
        ).order_by("jour")

        return Response(HoraireSerializer(horaires, many=True).data)


class SetHorairesView(APIView):

    @responsable_structure_required
    def put(self, request, structure_id):

        assert_gestionnaire_owns_structure(request.user, structure_id)

        serializer = HoraireBulkCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        structure = Structure.objects.get(id=structure_id)

        Horaire.objects.filter(structure=structure).delete()

        horaires = []
        for h in serializer.validated_data["horaires"]:
            horaires.append(
                Horaire(
                    structure=structure,
                    jour=h["jour"],
                    heure_ouverture=h.get("heure_ouverture"),
                    heure_fermeture=h.get("heure_fermeture"),
                    est_ferme=h.get("est_ferme", False),
                )
            )

        Horaire.objects.bulk_create(horaires)

        horaires_crees = Horaire.objects.filter(structure=structure).order_by("jour")

        return Response(
            {
                "message": "Horaires enregistrÃ©s",
                "data": HoraireSerializer(horaires_crees, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class UpdateSingleHoraireView(APIView):

    @responsable_structure_required
    def patch(self, request, pk):

        try:
            horaire = Horaire.objects.select_related("structure").get(id=pk)
        except Horaire.DoesNotExist:
            return Response(
                {"detail": "Horaire introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, horaire.structure_id)

        serializer = HoraireSerializer(horaire, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if not serializer.validated_data.get("est_ferme", False):
            ouverture = serializer.validated_data.get("heure_ouverture", horaire.heure_ouverture)
            fermeture = serializer.validated_data.get("heure_fermeture", horaire.heure_fermeture)
            if ouverture and fermeture and ouverture >= fermeture:
                return Response(
                    {"detail": "L'heure d'ouverture doit Ãªtre avant l'heure de fermeture."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer.save()

        return Response(
            {"message": "Horaire mis Ã  jour", "data": serializer.data},
            status=status.HTTP_200_OK,
        )
    

class StructureMapView(APIView):

    def get(self, request):

        structures = Structure.objects.filter(
            statut="ACTIVE",
            est_supprimee=False,
            latitude__isnull=False,
            longitude__isnull=False,
        )

        return Response(
            StructureMapSerializer(
                structures,
                many=True
            ).data
        )


class MyStructureView(APIView):

    @responsable_structure_required
    def get(self, request):
        structure = get_user_structure(request.user)
        if not structure:
            return Response(
                {"detail": "Aucune structure associÃ©e Ã  votre compte."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(StructureDetailSerializer(structure).data)

    @responsable_structure_required
    def patch(self, request, pk=None):
        try:
            structure = get_user_structure(request.user)
            if not structure or str(structure.id) != str(pk):
                raise Structure.DoesNotExist
        except Structure.DoesNotExist:
            return Response(
                {"detail": "Structure introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        allowed_fields = {"nom", "adresse", "telephone", "photo"}
        data = {k: v for k, v in request.data.items() if k in allowed_fields}

        serializer = StructureCreateSerializer(structure, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(StructureDetailSerializer(structure).data)


class OwnerStructuresView(APIView):

    @proprietaire_required
    def get(self, request):
        memberships = (
            EquipeStructure.objects.filter(
                utilisateur=request.user,
                role=RoleEquipeStructure.PROPRIETAIRE,
                statut=StatutEquipeStructure.ACTIF,
                structure__est_supprimee=False,
            )
            .select_related("structure")
            .order_by("structure__nom")
        )
        structures = [membership.structure for membership in memberships]
        return Response({
            "results": StructureDetailSerializer(structures, many=True).data,
        })

    @proprietaire_required
    def post(self, request):
        serializer = ProprietaireStructureCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        structure = Structure.objects.create(
            nom=serializer.validated_data["nom"],
            type=serializer.validated_data["type"],
            adresse=serializer.validated_data.get("adresse", ""),
            telephone=serializer.validated_data.get("telephone", ""),
            statut=StatutStructure.EN_ATTENTE,
        )

        EquipeStructure.objects.create(
            structure=structure,
            utilisateur=request.user,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
            date_activation=timezone.now(),
        )

        return Response(
            {
                "message": "Structure creee",
                "data": StructureDetailSerializer(structure).data,
            },
            status=status.HTTP_201_CREATED,
        )


class MyStructureTeamView(APIView):

    @proprietaire_required
    def get(self, request):
        structure_id = request.query_params.get("structure_id")
        if not structure_id:
            return Response(
                {"detail": "structure_id requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        assert_proprietaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id, est_supprimee=False)
        if not structure:
            return Response(
                {"detail": "Aucune structure associÃ©e Ã  votre compte."},
                status=status.HTTP_404_NOT_FOUND,
            )

        membres = structure.equipe.select_related("utilisateur").order_by("role", "utilisateur__nom")
        return Response({
            "structure": StructureDetailSerializer(structure).data,
            "results": EquipeStructureSerializer(membres, many=True).data,
        })

    @proprietaire_required
    def post(self, request):
        serializer = InviteStructureMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        structure_id = serializer.validated_data["structure_id"]
        assert_proprietaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id, est_supprimee=False)

        try:
            if serializer.validated_data["role"] == RoleEquipeStructure.GESTIONNAIRE:
                membre = InvitationService.inviter_gestionnaire(
                    nom=serializer.validated_data["nom"],
                    email=serializer.validated_data["email"],
                    structure=structure,
                )
            else:
                membre = InvitationService.inviter_caissier(
                    nom=serializer.validated_data["nom"],
                    email=serializer.validated_data["email"],
                    structure=structure,
                )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "Collaborateur pre-enregistre. Il creera son compte sur la page d'inscription.",
                "data": {
                    "id": str(membre.id),
                    "nom": membre.nom,
                    "email": membre.email,
                    "role": membre.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class StructureTeamMemberStatusView(APIView):

    @proprietaire_required
    def patch(self, request, member_id):
        serializer = UpdateStructureMemberStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            membership = (
                EquipeStructure.objects.select_related("structure", "utilisateur")
                .get(id=member_id, structure__est_supprimee=False)
            )
        except EquipeStructure.DoesNotExist:
            return Response(
                {"detail": "Membre introuvable."},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_proprietaire_owns_structure(request.user, membership.structure_id)

        if membership.role not in {
            RoleEquipeStructure.GESTIONNAIRE,
            RoleEquipeStructure.CAISSIER,
        }:
            return Response(
                {"detail": "Seuls les gestionnaires et caissiers peuvent etre modifies."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        utilisateur = membership.utilisateur
        action = serializer.validated_data["action"]

        if action == "DEACTIVATE":
            membership.statut = StatutEquipeStructure.SUSPENDU
            membership.save(update_fields=["statut"])
            utilisateur.is_active = False
            utilisateur.save(update_fields=["is_active"])
            message = "Collaborateur desactive."
        else:
            if utilisateur.has_usable_password() and utilisateur.email_verifie:
                membership.statut = StatutEquipeStructure.ACTIF
                if not membership.date_activation:
                    membership.date_activation = timezone.now()
                membership.save(update_fields=["statut", "date_activation"])
                utilisateur.is_active = True
                utilisateur.save(update_fields=["is_active"])
                message = "Collaborateur active."
            else:
                membership.statut = StatutEquipeStructure.INVITE
                membership.save(update_fields=["statut"])
                utilisateur.is_active = False
                utilisateur.save(update_fields=["is_active"])
                message = "Pre-enregistrement reactive. Le collaborateur doit finaliser son inscription."

        return Response(
            {
                "message": message,
                "data": EquipeStructureSerializer(membership).data,
            },
            status=status.HTTP_200_OK,
        )
