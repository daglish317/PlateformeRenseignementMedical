from rest_framework import serializers

from .models import Catalogue


class CatalogueSerializer(serializers.ModelSerializer):
    """
    Serializer utilisé pour la consultation.
    """

    type_display = serializers.CharField(
        source="get_type_display",
        read_only=True,
    )

    class Meta:
        model = Catalogue
        fields = [
            "id",
            "nom",
            "type",
            "type_display",
            "description",
            "est_actif",
            "date_creation",
            "date_modification",
        ]

        read_only_fields = [
            "id",
            "date_creation",
            "date_modification",
        ]


class CatalogueCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Validation des créations et des modifications.
    Aucune logique métier ici.
    """

    class Meta:
        model = Catalogue

        fields = [
            "nom",
            "type",
            "description",
            "est_actif",
        ]

    def validate_nom(self, value):

        value = " ".join(value.strip().split())

        if len(value) < 2:
            raise serializers.ValidationError(
                "Le nom est trop court."
            )

        return value

    def validate_description(self, value):

        return value.strip()

    def validate(self, attrs):

        nom = attrs["nom"]
        type_catalogue = attrs["type"]

        queryset = Catalogue.objects.filter(
            nom__iexact=nom,
            type=type_catalogue,
        )

        if self.instance:
            queryset = queryset.exclude(
                pk=self.instance.pk
            )

        if queryset.exists():
            raise serializers.ValidationError(
                {
                    "nom": (
                        "Une entrée portant ce nom "
                        "existe déjà pour ce type."
                    )
                }
            )

        return attrs