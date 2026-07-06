from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import ServiceMedical
from .serializers import ServiceMedicalSerializer, ServiceMedicalCreateSerializer
from .services import ServiceMedicalService

from utilisateurs.decorators import gestionnaire_required, admin_required
from structures.permissions import assert_gestionnaire_owns_structure


class CreateServiceMedicalView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = ServiceMedicalCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        assert_gestionnaire_owns_structure(request.user, data["structure_id"])

        service = ServiceMedicalService.ajouter_ou_mettre_a_jour(
            structure_id=data["structure_id"],
            catalogue_id=data["catalogue_id"],
            actif=data["actif"],
        )

        return Response(
            {"message": "Service médical enregistré", "data": ServiceMedicalSerializer(service).data},
            status=status.HTTP_201_CREATED,
        )


class ListServiceStructureView(APIView):

    def get(self, request, structure_id):

        services = ServiceMedical.objects.filter(
            structure_id=structure_id,
        ).select_related("catalogue")

        return Response(ServiceMedicalSerializer(services, many=True).data)


class AdminListServiceMedicalView(APIView):

    @admin_required
    def get(self, request):

        services = ServiceMedical.objects.all().select_related("structure", "catalogue")
        return Response(ServiceMedicalSerializer(services, many=True).data)


class DeactivateServiceMedicalView(APIView):

    @gestionnaire_required
    def patch(self, request, pk):

        service = ServiceMedical.objects.select_related("structure").get(id=pk)
        assert_gestionnaire_owns_structure(request.user, service.structure_id)

        service = ServiceMedicalService.ajouter_ou_mettre_a_jour(
            structure_id=service.structure_id,
            catalogue_id=service.catalogue_id,
            actif=False,
        )

        return Response({"message": "Service désactivé", "data": ServiceMedicalSerializer(service).data})
