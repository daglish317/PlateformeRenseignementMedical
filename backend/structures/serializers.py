from rest_framework import serializers

from .models import Structure


class StructureListSerializer(serializers.ModelSerializer):
    """
    Utilisé pour afficher les cartes de structures.
    """

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
        ]


class StructureDetailSerializer(serializers.ModelSerializer):
    """
    Utilisé pour afficher la fiche complète d'une structure.
    """

    gestionnaire = serializers.StringRelatedField()

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
            "statut",
            "gestionnaire",
            "date_creation",
            "date_validation",
        ]


class StructureCreateSerializer(serializers.ModelSerializer):
    """
    Validation des données de création.
    Aucune logique métier ici.
    """

    class Meta:
        model = Structure
        fields = [
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "latitude",
            "longitude",
        ]

    def validate_nom(self, value):

        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Le nom est trop court."
            )

        return value

    def validate_telephone(self, value):

        value = value.strip()

        if len(value) < 8:
            raise serializers.ValidationError(
                "Numéro de téléphone invalide."
            )

        return value