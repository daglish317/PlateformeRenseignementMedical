from django.db.models import Count, Q
from rest_framework import serializers

from .models import Inventaire, InventaireLigne, StatutInventaire


class InventaireLigneSerializer(serializers.ModelSerializer):

    medicament_id = serializers.UUIDField(read_only=True)
    statut_label = serializers.CharField(
        source="get_statut_display",
        read_only=True,
    )

    class Meta:
        model = InventaireLigne
        fields = [
            "id",
            "medicament_id",
            "nom",
            "forme_pharmaceutique",
            "quantite_physique",
            "quantite_reservee",
            "quantite_disponible",
            "seuil_alerte",
            "statut",
            "statut_label",
        ]


class InventaireListeSerializer(serializers.ModelSerializer):
    """Résumé général d'un inventaire (niveau 1 de la spécification)."""

    structure_id = serializers.UUIDField(read_only=True)
    structure_nom = serializers.CharField(
        source="structure.nom",
        read_only=True,
    )
    cree_par_nom = serializers.CharField(
        source="cree_par.nom",
        read_only=True,
    )
    date_generation = serializers.SerializerMethodField()
    heure_generation = serializers.SerializerMethodField()
    nombre_total_produits = serializers.SerializerMethodField()
    nombre_disponibles = serializers.SerializerMethodField()
    nombre_stock_faible = serializers.SerializerMethodField()
    nombre_ruptures = serializers.SerializerMethodField()

    class Meta:
        model = Inventaire
        fields = [
            "id",
            "numero",
            "structure_id",
            "structure_nom",
            "cree_par_nom",
            "role_createur",
            "cree_le",
            "date_generation",
            "heure_generation",
            "nombre_total_produits",
            "nombre_disponibles",
            "nombre_stock_faible",
            "nombre_ruptures",
        ]

    def get_date_generation(self, obj):
        return obj.cree_le.strftime("%Y-%m-%d") if obj.cree_le else None

    def get_heure_generation(self, obj):
        return obj.cree_le.strftime("%H:%M") if obj.cree_le else None

    def _compteurs(self, obj):
        return obj.lignes.aggregate(
            total=Count("id"),
            disponibles=Count(
                "id",
                filter=Q(statut=StatutInventaire.DISPONIBLE),
            ),
            stock_faible=Count(
                "id",
                filter=Q(statut=StatutInventaire.STOCK_FAIBLE),
            ),
            ruptures=Count(
                "id",
                filter=Q(statut=StatutInventaire.RUPTURE),
            ),
        )

    def get_nombre_total_produits(self, obj):
        return self._compteurs(obj)["total"]

    def get_nombre_disponibles(self, obj):
        return self._compteurs(obj)["disponibles"]

    def get_nombre_stock_faible(self, obj):
        return self._compteurs(obj)["stock_faible"]

    def get_nombre_ruptures(self, obj):
        return self._compteurs(obj)["ruptures"]


class InventaireDetailSerializer(InventaireListeSerializer):
    """Inventaire complet avec le detail des produits (niveau 2)."""

    lignes = serializers.SerializerMethodField()

    class Meta(InventaireListeSerializer.Meta):
        fields = InventaireListeSerializer.Meta.fields + ["lignes"]

    def get_lignes(self, obj):
        lignes = self.context.get("lignes")
        if lignes is None:
            lignes = obj.lignes.all()
        return InventaireLigneSerializer(lignes, many=True).data
