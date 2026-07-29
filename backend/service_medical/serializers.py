from rest_framework import serializers

from .models import ServiceMedical
from structures.models import StructureService


class StructureServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructureService
        fields = ["id", "nom", "type"]


class ServiceMedicalSerializer(serializers.ModelSerializer):

    service = StructureServiceSerializer(read_only=True)

    class Meta:
        model = ServiceMedical
        fields = [
            "id",
            "structure",
            "service",
            "actif",
            "date_ajout",
        ]


class ServiceMedicalCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    service_id = serializers.UUIDField(required=False)
    nom = serializers.CharField(max_length=255, required=False)
    actif = serializers.BooleanField(default=True)

    def validate_structure_id(self, value):
        from structures.models import Structure
        if not Structure.objects.filter(id=value).exists():
            raise serializers.ValidationError("Structure invalide.")
        return value

    def validate(self, data):
        if not data.get("service_id") and not data.get("nom"):
            raise serializers.ValidationError("Fournissez service_id ou nom.")
        return data
