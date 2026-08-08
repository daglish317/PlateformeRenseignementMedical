from rest_framework import serializers

from .models import EvenementHistorique


class EvenementHistoriqueSerializer(serializers.ModelSerializer):
    """Sérialiseur d'un événement d'historique.

    Niveau 1 (liste) : identité, utilisateur, date/heure et résumé.
    Niveau 2 (détail) : le champ `donnees` contient la fiche complète.
    """

    type_label = serializers.CharField(
        source="get_type_display",
        read_only=True,
    )

    structure_nom = serializers.CharField(
        source="structure.nom",
        read_only=True,
    )

    utilisateur_nom = serializers.CharField(
        source="utilisateur.nom",
        read_only=True,
    )

    date_evenement = serializers.SerializerMethodField()

    heure_evenement = serializers.SerializerMethodField()

    resume = serializers.SerializerMethodField()

    class Meta:
        model = EvenementHistorique
        fields = [
            "id",
            "type",
            "type_label",
            "structure_id",
            "structure_nom",
            "utilisateur_id",
            "utilisateur_nom",
            "role",
            "cree_le",
            "date_evenement",
            "heure_evenement",
            "resume",
            "donnees",
        ]

    def get_date_evenement(self, obj):
        return f"{obj.cree_le:%d/%m/%Y}"

    def get_heure_evenement(self, obj):
        return f"{obj.cree_le:%H:%M}"

    def get_resume(self, obj):
        donnees = obj.donnees or {}
        if obj.type == "CAISSE_RETOUR":
            nb = donnees.get("nb_articles") or 0
        elif obj.type == "INVENTAIRE_GENERE":
            nb = donnees.get("nb_produits") or 0
        else:
            nb = donnees.get("nb_produits") or 0
        return {
            "nombre": nb,
            "numero": donnees.get("numero") or donnees.get("numero_retour"),
            "facture": donnees.get("numero_facture"),
        }
