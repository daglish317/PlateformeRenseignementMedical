from rest_framework import serializers

from .models import PlateauTechnique
from structures.models import StructureService


class StructureServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureService
        fields = ["id", "nom", "type"]


class PlateauTechniqueSerializer(serializers.ModelSerializer):

    service = StructureServiceSerializer(read_only=True)

    class Meta:
        model = PlateauTechnique
        fields = [
            "id",
            "structure",
            "service",
            "disponible",
            "date_ajout",
        ]


class PlateauTechniqueCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    service_id = serializers.UUIDField(required=False)
    nom = serializers.CharField(max_length=255, required=False)
    disponible = serializers.BooleanField(default=True)

    def validate(self, data):
        if not data.get("service_id") and not data.get("nom"):
            raise serializers.ValidationError("Fournissez service_id ou nom.")
        return data
