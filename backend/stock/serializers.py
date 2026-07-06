from rest_framework import serializers

from .models import StockItem, StockMovement


class StockSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockItem
        fields = [
            "id",
            "structure",
            "nom",
            "type_item",
            "quantite",
            "seuil_alerte",
            "disponible",
            "date_ajout",
        ]
        read_only_fields = ["id", "date_ajout"]


class StockMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockMovement
        fields = "__all__"
