from rest_framework import serializers

from .models import Maladie, PriseEnCharge
from structures.models import Structure


class MaladieSerializer(serializers.ModelSerializer):

    class Meta:
        model = Maladie
        fields = ["id", "nom"]


class PriseEnChargeSerializer(serializers.ModelSerializer):

    maladie = MaladieSerializer(read_only=True)

    class Meta:
        model = PriseEnCharge
        fields = [
            "id",
            "structure",
            "maladie",
            "niveau",
            "date_ajout",
        ]


class PriseEnChargeCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    maladie_nom = serializers.CharField(max_length=255)
    niveau = serializers.CharField(required=False, allow_blank=True)

    def validate_structure_id(self, value):
        if not Structure.objects.filter(id=value).exists():
            raise serializers.ValidationError("Structure invalide.")
        return value