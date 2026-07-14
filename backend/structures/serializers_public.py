from rest_framework import serializers

from .models import Structure


class StructureMapSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour l'affichage public sur la carte.
    Données minimales nécessaires.
    """

    class Meta:
        model = Structure

        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "latitude",
            "longitude",
        ]