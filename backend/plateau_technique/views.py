from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import PlateauTechnique
from .serializers import PlateauTechniqueSerializer, PlateauTechniqueCreateSerializer
from .services import PlateauTechniqueService

from utilisateurs.decorators import gestionnaire_required, admin_required
from structures.permissions import assert_gestionnaire_owns_structure


class CreatePlateauTechniqueView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = PlateauTechniqueCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        assert_gestionnaire_owns_structure(request.user, data["structure_id"])

        plateau = PlateauTechniqueService.ajouter_ou_mettre_a_jour(
            structure_id=data["structure_id"],
            catalogue_id=data["catalogue_id"],
            disponible=data["disponible"],
        )

        return Response(
            {"message": "Équipement enregistré", "data": PlateauTechniqueSerializer(plateau).data},
            status=status.HTTP_201_CREATED,
        )


class ListPlateauStructureView(APIView):

    def get(self, request, structure_id):

        data = PlateauTechnique.objects.filter(
            structure_id=structure_id,
        ).select_related("catalogue")

        return Response(PlateauTechniqueSerializer(data, many=True).data)


class AdminListPlateauView(APIView):

    @admin_required
    def get(self, request):

        data = PlateauTechnique.objects.all().select_related("structure", "catalogue")
        return Response(PlateauTechniqueSerializer(data, many=True).data)


class DeactivatePlateauView(APIView):

    @gestionnaire_required
    def patch(self, request, pk):

        plateau = PlateauTechnique.objects.select_related("structure").get(id=pk)
        assert_gestionnaire_owns_structure(request.user, plateau.structure_id)

        plateau = PlateauTechniqueService.ajouter_ou_mettre_a_jour(
            structure_id=plateau.structure_id,
            catalogue_id=plateau.catalogue_id,
            disponible=False,
        )

        return Response({"message": "Équipement indisponible", "data": PlateauTechniqueSerializer(plateau).data})
