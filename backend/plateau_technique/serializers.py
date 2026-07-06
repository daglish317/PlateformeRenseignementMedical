from rest_framework import serializers

from .models import PlateauTechnique
from catalogues.models import Catalogue


class CatalogueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Catalogue
        fields = ["id", "nom", "type"]


class PlateauTechniqueSerializer(serializers.ModelSerializer):

    catalogue = CatalogueSerializer(read_only=True)

    class Meta:
        model = PlateauTechnique
        fields = [
            "id",
            "structure",
            "catalogue",
            "disponible",
            "date_ajout",
        ]


class PlateauTechniqueCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    catalogue_id = serializers.UUIDField()
    disponible = serializers.BooleanField(default=True)