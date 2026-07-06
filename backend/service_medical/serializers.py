from rest_framework import serializers

from .models import ServiceMedical
from catalogues.models import Catalogue


class CatalogueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalogue
        fields = ["id", "nom", "type"]


class ServiceMedicalSerializer(serializers.ModelSerializer):

    catalogue = CatalogueSerializer(read_only=True)

    class Meta:
        model = ServiceMedical
        fields = [
            "id",
            "structure",
            "catalogue",
            "actif",
            "date_ajout",
        ]


class ServiceMedicalCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    catalogue_id = serializers.UUIDField()
    actif = serializers.BooleanField(default=True)

    def validate_structure_id(self, value):
        from structures.models import Structure

        if not Structure.objects.filter(id=value).exists():
            raise serializers.ValidationError("Structure invalide.")
        return value

    def validate_catalogue_id(self, value):
        from catalogues.models import Catalogue

        if not Catalogue.objects.filter(id=value).exists():
            raise serializers.ValidationError("Catalogue invalide.")
        return value