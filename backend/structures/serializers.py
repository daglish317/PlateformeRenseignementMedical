from rest_framework import serializers
from .models import Structure


class StructureCreateSerializer(serializers.ModelSerializer):
    """
    Création structure (gestionnaire)
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
            raise serializers.ValidationError("Nom trop court")
        return value

    def validate_telephone(self, value):
        value = value.strip()
        if len(value) < 8:
            raise serializers.ValidationError("Numéro invalide")
        return value


class StructureListSerializer(serializers.ModelSerializer):
    """
    Affichage en cartes (liste frontend)
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
    Détail complet structure
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
            "motif_refus",
            "valide_par",
            "date_creation",
            "date_validation",
        ]


class StructureValidationSerializer(serializers.Serializer):

    action = serializers.ChoiceField(
        choices=[
            ("APPROVE", "APPROVE"),
            ("REJECT", "REJECT"),
        ]
    )

    motif = serializers.CharField(
        required=False,
        allow_blank=True
    )

    def validate(self, attrs):

        if attrs["action"] == "REJECT":

            if not attrs.get("motif"):
                raise serializers.ValidationError(
                    {
                        "motif": "Le motif est obligatoire."
                    }
                )

        return attrs