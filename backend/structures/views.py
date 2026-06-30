from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Structure
from .serializers import (
    StructureCreateSerializer,
    StructureListSerializer,
    StructureDetailSerializer,
)
from .services import StructureService

from utilisateurs.decorators import gestionnaire_required, admin_required


class CreateStructureView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = StructureCreateSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        structure = StructureService.creer_structure(
            gestionnaire=request.user,
            donnees=serializer.validated_data,
        )

        return Response(
            {
                "message": "Structure soumise avec succès.",
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
                {"message": "Structure introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = request.data.get("action")

        if action == "APPROVE":
            structure = StructureService.valider_structure(structure)

            message = "Structure validée avec succès."

        elif action == "REJECT":
            structure = StructureService.refuser_structure(structure)

            message = "Structure refusée."

        else:
            return Response(
                {"message": "Action invalide"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": message,
                "data": StructureDetailSerializer(structure).data,
            }
        )