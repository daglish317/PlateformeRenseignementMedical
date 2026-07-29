from rest_framework import serializers

from .models import PriseEnCharge
from structures.models import Structure, StructureService


class StructureServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureService
        fields = ["id", "nom", "type"]


class PriseEnChargeSerializer(serializers.ModelSerializer):

    service = StructureServiceSerializer(read_only=True)

    class Meta:
        model = PriseEnCharge
        fields = [
            "id",
            "structure",
            "service",
            "niveau",
            "date_ajout",
        ]


class PriseEnChargeCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    service_id = serializers.UUIDField(required=False)
    nom = serializers.CharField(max_length=255, required=False)
    niveau = serializers.CharField(required=False, allow_blank=True)

    def validate_structure_id(self, value):
        if not Structure.objects.filter(id=value).exists():
            raise serializers.ValidationError("Structure invalide.")
        return value

    def validate(self, data):
        if not data.get("service_id") and not data.get("nom"):
            raise serializers.ValidationError("Fournissez service_id ou nom.")
        return data


class PriseEnChargeUpdateSerializer(serializers.Serializer):

    niveau = serializers.CharField(required=False, allow_blank=True)
