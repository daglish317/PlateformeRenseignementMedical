from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import PriseEnCharge
from .serializers import (
    PriseEnChargeSerializer,
    PriseEnChargeCreateSerializer
)
from .services import PriseEnChargeService

from utilisateurs.decorators import gestionnaire_required, admin_required


class CreatePriseEnChargeView(APIView):

    @gestionnaire_required
    def post(self, request):

        serializer = PriseEnChargeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        prise = PriseEnChargeService.ajouter_ou_mettre_a_jour(
            structure_id=data["structure_id"],
            maladie_nom=data["maladie_nom"],
            niveau=data.get("niveau")
        )

        return Response(
            {
                "message": "Prise en charge enregistrée",
                "data": PriseEnChargeSerializer(prise).data
            },
            status=status.HTTP_201_CREATED
        )


class ListPriseEnChargeStructureView(APIView):

    def get(self, request, structure_id):

        prises = PriseEnCharge.objects.filter(
            structure_id=structure_id
        ).select_related("maladie")

        return Response(
            PriseEnChargeSerializer(prises, many=True).data
        )


class AdminListPriseEnChargeView(APIView):

    @admin_required
    def get(self, request):

        prises = PriseEnCharge.objects.all().select_related(
            "structure", "maladie"
        )

        return Response(
            PriseEnChargeSerializer(prises, many=True).data
        )
