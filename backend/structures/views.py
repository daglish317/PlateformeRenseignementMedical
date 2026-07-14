from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers_public import StructureMapSerializer
from .models import Structure, Favori, Horaire
from .serializers import (
    StructureCreateSerializer,
    StructureListSerializer,
    StructureDetailSerializer,
    StructureValidationSerializer,
    FavoriCreateSerializer,
    FavoriSerializer,
    HoraireSerializer,
    HoraireBulkCreateSerializer,
    StructureMapSerializer,
)

from .services import StructureService, StructureGeoService
from utilisateurs.decorators import gestionnaire_required, admin_required
from .permissions import assert_gestionnaire_owns_structure


class CreateStructureView(APIView):

    @gestionnaire_required
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
                "message": "Structure créée avec succès",
                "data": StructureDetailSerializer(structure).data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminListStructuresView(APIView):

    @admin_required
    def get(self, request):

        structures = Structure.objects.all().order_by("-date_creation")

        return Response(
            StructureListSerializer(structures, many=True).data
        )


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

                message = "Structure validée avec succès."

            else:

                structure = StructureService.refuser_structure(
                    structure=structure,
                    administrateur=request.user,
                    motif=serializer.validated_data["motif"],
                )

                message = "Structure refusée avec succès."

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
                {"detail": "Déjà dans vos favoris"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Ajouté aux favoris", "data": FavoriSerializer(favori).data},
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
            {"message": "Retiré des favoris"},
            status=status.HTTP_200_OK,
        )


class ListFavorisView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        favoris = Favori.objects.filter(
            utilisateur=request.user,
        ).select_related("structure").order_by("-date_ajout")

        return Response(FavoriSerializer(favoris, many=True).data)


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

    @gestionnaire_required
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
                "message": "Horaires enregistrés",
                "data": HoraireSerializer(horaires_crees, many=True).data,
            },
            status=status.HTTP_200_OK,
        )


class UpdateSingleHoraireView(APIView):

    @gestionnaire_required
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
                    {"detail": "L'heure d'ouverture doit être avant l'heure de fermeture."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer.save()

        return Response(
            {"message": "Horaire mis à jour", "data": serializer.data},
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