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
    forme_pharmaceutique = serializers.SerializerMethodField()
    forme_label = serializers.SerializerMethodField()

    class Meta:
        model = StockItem
        fields = [
            "id",
            "structure",
            "nom",
            "type_item",
            "forme_pharmaceutique",
            "forme_label",
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

    def _medicament(self, obj):
        return (
            Medicament.objects.filter(
                structure=obj.structure,
                nom=obj.nom,
            ).first()
        )

    def get_forme_pharmaceutique(self, obj):
        medicament = self._medicament(obj)
        return medicament.forme_pharmaceutique if medicament else None

    def get_forme_label(self, obj):
        medicament = self._medicament(obj)
        if medicament:
            return medicament.get_forme_pharmaceutique_display()
        return None


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
    stock_avant = serializers.SerializerMethodField()

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
            "stock_avant",
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
            ).first()
        )

    def get_stock_physique(self, obj):
        value = getattr(obj, "_stock_physique", None)
        if value is None:
            item = self._stock_item(obj)
            return item.quantite if item else 0
        return value

    def get_stock_disponible(self, obj):
        physique = getattr(obj, "_stock_physique", None)
        if physique is None:
            item = self._stock_item(obj)
            return item.stock_disponible if item else 0
        reservee = getattr(obj, "_stock_reservee", None) or 0
        return max(physique - reservee, 0)

    def get_stock_avant(self, obj):
        value = getattr(obj, "_stock_avant", None)
        if value is not None:
            return value
        item = self._stock_item(obj)
        return item.quantite if item else 0


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
            "stock_avant",
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
            "montant_total_declare",
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
    stock_avant = serializers.IntegerField(required=False, min_value=0)


class ApprovisionnementCreateSerializer(serializers.Serializer):

    date_reception = serializers.DateField()
    fournisseur = serializers.CharField(required=False, allow_blank=True, default="")
    reference_bon = serializers.CharField(required=False, allow_blank=True, default="")
    montant_total_declare = serializers.DecimalField(max_digits=12, decimal_places=2)
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


class ProduitPeremptionSerializer(serializers.ModelSerializer):

    nom = serializers.CharField(source="medicament.nom", read_only=True)
    type = serializers.CharField(source="get_forme_pharmaceutique_display", read_only=True)
    quantite_actuelle = serializers.SerializerMethodField()
    temps_restant = serializers.SerializerMethodField()
    statut = serializers.SerializerMethodField()

    class Meta:
        model = LigneApprovisionnement
        fields = [
            "id",
            "nom",
            "type",
            "quantite_actuelle",
            "date_peremption",
            "temps_restant",
            "statut",
        ]

    def get_quantite_actuelle(self, obj):
        item = (
            StockItem.objects.filter(
                structure=obj.approvisionnement.structure,
                nom=obj.medicament.nom,
            ).first()
        )
        return item.quantite if item else 0

    def get_statut(self, obj):
        from django.utils import timezone

        if obj.date_peremption < timezone.localdate():
            return "EXPIRE"
        return "PROCHE"

    def get_temps_restant(self, obj):
        from django.utils import timezone

        today = timezone.localdate()
        delta = (obj.date_peremption - today).days
        if delta < 0:
            return f"Expire depuis {abs(delta)} jour(s)"
        if delta == 0:
            return "Expire aujourd'hui"
        if delta < 31:
            return f"Expire dans {delta} jour(s)"
        months = max(round(delta / 30), 1)
        return f"Expire dans {months} mois"
