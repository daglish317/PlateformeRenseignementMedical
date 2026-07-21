from rest_framework import serializers
from .models import Structure, Favori, Horaire


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


class StructureAdminListSerializer(serializers.ModelSerializer):
    gestionnaire_nom = serializers.CharField(source="gestionnaire.nom", read_only=True)
    gestionnaire_email = serializers.CharField(source="gestionnaire.email", read_only=True)

    class Meta:
        model = Structure
        fields = [
            "id",
            "nom",
            "type",
            "photo",
            "adresse",
            "telephone",
            "statut",
            "gestionnaire_nom",
            "gestionnaire_email",
            "date_creation",
            "latitude",
            "longitude",
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


class FavoriCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()


class FavoriSerializer(serializers.ModelSerializer):

    structure = StructureListSerializer(read_only=True)

    class Meta:
        model = Favori
        fields = [
            "id",
            "structure",
            "date_ajout",
        ]


class HoraireSerializer(serializers.ModelSerializer):

    class Meta:
        model = Horaire
        fields = [
            "id",
            "jour",
            "heure_ouverture",
            "heure_fermeture",
            "est_ferme",
        ]


class HoraireBulkCreateSerializer(serializers.Serializer):

    horaires = HoraireSerializer(many=True)

    def validate_horaires(self, value):
        jours_vus = set()
        for h in value:
            jour = h.get("jour")
            if jour in jours_vus:
                raise serializers.ValidationError(f"Le jour {jour} est duplicé.")
            jours_vus.add(jour)

            if not h.get("est_ferme", False):
                ouverture = h.get("heure_ouverture")
                fermeture = h.get("heure_fermeture")
                if ouverture and fermeture and ouverture >= fermeture:
                    raise serializers.ValidationError(
                        f"Pour {jour}: l'heure d'ouverture doit être avant l'heure de fermeture."
                    )
        return value


class StructureMapSerializer(serializers.ModelSerializer):

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



class StructurePublicMapSerializer(serializers.ModelSerializer):
    """
    Données publiques utilisées par la carte et les résultats de recherche.
    """

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
        ]