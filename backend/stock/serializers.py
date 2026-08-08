from rest_framework import serializers

from .models import (
    Approvisionnement,
    LigneApprovisionnement,
    Medicament,
    StockItem,
    StockMovement,
)
from .services import ApprovisionnementService


class StockSerializer(serializers.ModelSerializer):

    stock_disponible = serializers.SerializerMethodField()

    class Meta:
        model = StockItem
        fields = [
            "id",
            "structure",
            "nom",
            "type_item",
            "quantite",
            "quantite_reservee",
            "stock_disponible",
            "seuil_alerte",
            "disponible",
            "date_ajout",
        ]
        read_only_fields = ["id", "date_ajout"]

    def get_stock_disponible(self, obj):
        return obj.stock_disponible


class StockMovementSerializer(serializers.ModelSerializer):

    class Meta:
        model = StockMovement
        fields = "__all__"


class MedicamentSerializer(serializers.ModelSerializer):

    forme_label = serializers.CharField(
        source="get_forme_pharmaceutique_display",
        read_only=True,
    )

    stock_physique = serializers.SerializerMethodField()
    stock_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Medicament
        fields = [
            "id",
            "nom",
            "forme_pharmaceutique",
            "forme_label",
            "prix_vente",
            "tva",
            "en_reserve",
            "stock_physique",
            "stock_disponible",
            "date_creation",
        ]
        read_only_fields = ["id", "date_creation"]

    def _stock_item(self, obj):
        return (
            StockItem.objects.filter(
                structure=obj.structure,
                nom=obj.nom,
                type_item=StockItem.TYPE_MEDICAMENT,
            ).first()
        )

    def get_stock_physique(self, obj):
        item = self._stock_item(obj)
        return item.quantite if item else 0

    def get_stock_disponible(self, obj):
        item = self._stock_item(obj)
        return item.stock_disponible if item else 0


class LigneApprovisionnementSerializer(serializers.ModelSerializer):

    medicament_nom = serializers.CharField(
        source="medicament.nom",
        read_only=True,
    )

    forme_label = serializers.CharField(
        source="get_forme_pharmaceutique_display",
        read_only=True,
    )

    class Meta:
        model = LigneApprovisionnement
        fields = [
            "id",
            "medicament",
            "medicament_nom",
            "forme_pharmaceutique",
            "forme_label",
            "quantite",
            "prix_achat",
            "prix_vente",
            "date_peremption",
            "tva",
            "en_reserve",
        ]


class ApprovisionnementSerializer(serializers.ModelSerializer):

    lignes = LigneApprovisionnementSerializer(many=True, read_only=True)

    cree_par_nom = serializers.CharField(
        source="cree_par.nom",
        read_only=True,
    )

    class Meta:
        model = Approvisionnement
        fields = [
            "id",
            "structure",
            "numero",
            "date_reception",
            "fournisseur",
            "reference_bon",
            "cree_par",
            "cree_par_nom",
            "cree_le",
            "lignes",
        ]
        read_only_fields = ["id", "numero", "cree_par", "cree_le"]


class LigneApprovisionnementInputSerializer(serializers.Serializer):

    nom = serializers.CharField()
    forme_pharmaceutique = serializers.CharField()
    quantite = serializers.IntegerField()
    prix_achat = serializers.DecimalField(max_digits=12, decimal_places=2)
    prix_vente = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        required=False,
        allow_null=True,
    )
    date_peremption = serializers.DateField()
    tva = serializers.BooleanField(required=False, default=False)
    en_reserve = serializers.BooleanField(required=False, default=False)


class ApprovisionnementCreateSerializer(serializers.Serializer):

    date_reception = serializers.DateField()
    fournisseur = serializers.CharField(required=False, allow_blank=True, default="")
    reference_bon = serializers.CharField(required=False, allow_blank=True, default="")
    lignes = serializers.ListField(child=serializers.DictField())

    def validate_lignes(self, value):
        if not value:
            raise serializers.ValidationError(
                "La livraison doit contenir au moins un médicament."
            )
        return value

    def validate(self, attrs):
        errors = []
        lignes = []

        for index, raw in enumerate(attrs["lignes"]):
            sub = LigneApprovisionnementInputSerializer(data=raw)
            if not sub.is_valid():
                messages = []
                for field, field_errors in sub.errors.items():
                    messages.append(
                        f"{field}: {'; '.join(str(e) for e in field_errors)}"
                    )
                errors.append({"index": index, "erreur": " ; ".join(messages)})
                continue

            ligne = sub.validated_data
            ligne_error = ApprovisionnementService.valider_ligne(ligne)
            if ligne_error:
                errors.append({"index": index, "erreur": ligne_error})
                continue

            lignes.append(ligne)

        if errors:
            raise serializers.ValidationError({"errors": errors})

        attrs["lignes"] = lignes
        return attrs

    def create(self, validated_data):
        return ApprovisionnementService.enregistrer(
            structure=self.context["structure"],
            cree_par=self.context["request"].user,
            **validated_data,
        )
