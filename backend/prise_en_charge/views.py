from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import PriseEnCharge
from .serializers import PriseEnChargeSerializer, PriseEnChargeCreateSerializer, PriseEnChargeUpdateSerializer
from .services import PriseEnChargeService

from utilisateurs.decorators import gestionnaire_required, admin_required
from structures.permissions import assert_gestionnaire_owns_structure


class CreatePriseEnChargeView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = PriseEnChargeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        assert_gestionnaire_owns_structure(request.user, data["structure_id"])

        prise = PriseEnChargeService.ajouter_ou_mettre_a_jour(
            structure_id=data["structure_id"],
            catalogue_id=data["catalogue_id"],
            niveau=data.get("niveau"),
        )

        return Response(
            {"message": "Prise en charge enregistrée", "data": PriseEnChargeSerializer(prise).data},
            status=status.HTTP_201_CREATED,
        )


class UpdatePriseEnChargeView(APIView):

    @gestionnaire_required
    def patch(self, request, pk):

        try:
            prise_en_charge = PriseEnCharge.objects.select_related("structure").get(id=pk)
        except PriseEnCharge.DoesNotExist:
            return Response(
                {"detail": "Prise en charge introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, prise_en_charge.structure_id)

        serializer = PriseEnChargeUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prise_en_charge = PriseEnChargeService.modifier(
            prise_en_charge=prise_en_charge,
            niveau=serializer.validated_data.get("niveau"),
        )

        return Response(
            {"message": "Prise en charge mise à jour", "data": PriseEnChargeSerializer(prise_en_charge).data},
            status=status.HTTP_200_OK,
        )


class DeletePriseEnChargeView(APIView):

    @gestionnaire_required
    def delete(self, request, pk):

        try:
            prise_en_charge = PriseEnCharge.objects.select_related("structure").get(id=pk)
        except PriseEnCharge.DoesNotExist:
            return Response(
                {"detail": "Prise en charge introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, prise_en_charge.structure_id)

        PriseEnChargeService.supprimer(prise_en_charge=prise_en_charge)

        return Response(
            {"message": "Prise en charge supprimée"},
            status=status.HTTP_200_OK,
        )


class ListPriseEnChargeStructureView(APIView):

    def get(self, request, structure_id):

        prises = PriseEnCharge.objects.filter(
            structure_id=structure_id,
        ).select_related("catalogue")

        niveau = request.query_params.get("niveau")
        type_catalogue = request.query_params.get("type")

        if niveau:
            prises = prises.filter(niveau=niveau)
        if type_catalogue:
            prises = prises.filter(catalogue__type=type_catalogue)

        return Response(PriseEnChargeSerializer(prises, many=True).data)


class AdminListPriseEnChargeView(APIView):

    @admin_required
    def get(self, request):

        prises = PriseEnCharge.objects.all().select_related("structure", "catalogue")
        return Response(PriseEnChargeSerializer(prises, many=True).data)
