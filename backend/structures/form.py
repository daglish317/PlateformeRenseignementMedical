from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from utilisateurs.decorators import gestionnaire_required
from structures.serializers import StructureCreateSerializer, StructureDetailSerializer
from structures.services import StructureService


class StructureFormSubmitView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = StructureCreateSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            structure = StructureService.creer_structure(
                gestionnaire=request.user,
                donnees=serializer.validated_data,
            )
        except ValueError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "message": "Structure soumise avec succès. En attente de validation.",
            "data": StructureDetailSerializer(structure).data,
        }, status=201)
