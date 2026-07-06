from rest_framework import serializers

from .models import PriseEnCharge
from catalogues.models import Catalogue
from structures.models import Structure


class CatalogueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalogue
        fields = ["id", "nom", "type"]


class PriseEnChargeSerializer(serializers.ModelSerializer):

    catalogue = CatalogueSerializer(read_only=True)

    class Meta:
        model = PriseEnCharge
        fields = [
            "id",
            "structure",
            "catalogue",
            "niveau",
            "date_ajout",
        ]


class PriseEnChargeCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    catalogue_id = serializers.UUIDField()
    niveau = serializers.CharField(required=False, allow_blank=True)

    def validate_structure_id(self, value):
        if not Structure.objects.filter(id=value).exists():
            raise serializers.ValidationError("Structure invalide.")
        return value

    def validate_catalogue_id(self, value):
        if not Catalogue.objects.filter(id=value).exists():
            raise serializers.ValidationError("Catalogue invalide.")
        return value