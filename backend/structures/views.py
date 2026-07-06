from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Structure
from .serializers import (
    StructureCreateSerializer,
    StructureListSerializer,
    StructureDetailSerializer,
    StructureValidationSerializer,
)

from .services import StructureService, StructureGeoService
from utilisateurs.decorators import gestionnaire_required, admin_required


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
                "structure": StructureListSerializer(r["structure"]).data,
                "distance_km": r["distance"]
            })

        return Response(data)