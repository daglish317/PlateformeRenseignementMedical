from rest_framework import serializers

from .models import Alerte


class AlerteSerializer(serializers.ModelSerializer):
    """Sérialiseur d'une alerte.

    Niveau 1 (liste) : identité, catégorie, type, priorité, module,
    titre, description, date/heure, état de lecture et de résolution.
    Niveau 2 (détail) : le champ `donnees` contient la fiche complète de
    la situation détectée.
    """

    categorie_label = serializers.CharField(
        source="get_categorie_display",
        read_only=True,
    )

    type_label = serializers.CharField(
        source="get_type_display",
        read_only=True,
    )

    priorite_label = serializers.CharField(
        source="get_priorite_display",
        read_only=True,
    )

    module_label = serializers.CharField(
        source="get_module_display",
        read_only=True,
    )

    structure_nom = serializers.CharField(
        source="structure.nom",
        read_only=True,
    )

    utilisateur_concerne_id = serializers.UUIDField(
        source="utilisateur_concerne.id",
        read_only=True,
        default=None,
    )

    utilisateur_concerne_nom = serializers.CharField(
        source="utilisateur_concerne.nom",
        read_only=True,
        default=None,
    )

    date_alerte = serializers.SerializerMethodField()

    heure_alerte = serializers.SerializerMethodField()

    est_lue = serializers.SerializerMethodField()

    class Meta:
        model = Alerte
        fields = [
            "id",
            "structure_id",
            "structure_nom",
            "categorie",
            "categorie_label",
            "type",
            "type_label",
            "priorite",
            "priorite_label",
            "module",
            "module_label",
            "titre",
            "description",
            "cree_le",
            "date_alerte",
            "heure_alerte",
            "est_resolue",
            "est_lue",
            "utilisateur_concerne_id",
            "utilisateur_concerne_nom",
            "donnees",
        ]

    def get_date_alerte(self, obj):
        return f"{obj.cree_le:%d/%m/%Y}"

    def get_heure_alerte(self, obj):
        return f"{obj.cree_le:%H:%M}"

    def get_est_lue(self, obj):
        utilisateur = self.context.get("request").user
        return obj.est_lue_par(utilisateur)
