from rest_framework import serializers

from .models import (
    EtatVente,
    Facture,
    LigneVente,
    ModePaiement,
    MotifRetour,
    OperationCaisse,
    Paiement,
    RetourCaisse,
    RetourCaisseLigne,
    Vente,
)


class LigneVenteSerializer(serializers.ModelSerializer):

    forme_label = serializers.SerializerMethodField()

    class Meta:
        model = LigneVente
        fields = [
            "id",
            "medicament",
            "designation",
            "forme_pharmaceutique",
            "forme_label",
            "prix_unitaire",
            "quantite",
            "montant",
            "tva",
        ]

    def get_forme_label(self, obj):
        field = LigneVente._meta.get_field("forme_pharmaceutique")
        if not field.choices:
            return obj.forme_pharmaceutique
        return dict(field.choices).get(obj.forme_pharmaceutique, obj.forme_pharmaceutique)


class PaiementSerializer(serializers.ModelSerializer):

    encaisse_par_nom = serializers.CharField(
        source="encaisse_par.nom",
        read_only=True,
    )

    class Meta:
        model = Paiement
        fields = [
            "id",
            "mode",
            "montant",
            "encaisse_par",
            "encaisse_par_nom",
            "effectue_le",
        ]


class FactureSerializer(serializers.ModelSerializer):

    class Meta:
        model = Facture
        fields = [
            "id",
            "structure",
            "numero",
            "vente",
            "paiement",
            "beneficiaire",
            "montant_total",
            "nb_articles",
            "cree_le",
        ]


class FactureListSerializer(serializers.ModelSerializer):

    vente_numero = serializers.CharField(
        source="vente.numero",
        read_only=True,
    )
    vente_date = serializers.DateTimeField(
        source="vente.validee_le",
        read_only=True,
    )
    structure_nom = serializers.CharField(
        source="structure.nom",
        read_only=True,
    )

    class Meta:
        model = Facture
        fields = [
            "id",
            "numero",
            "structure",
            "structure_nom",
            "vente",
            "vente_numero",
            "vente_date",
            "beneficiaire",
            "montant_total",
            "nb_articles",
            "cree_le",
        ]


class FactureDetailSerializer(FactureListSerializer):
    """Facture enrichie : produits (lignes), paiement, pharmacie."""

    lignes = LigneVenteSerializer(
        source="vente.lignes",
        many=True,
        read_only=True,
    )
    paiement_mode = serializers.CharField(
        source="paiement.mode",
        read_only=True,
    )
    structure_adresse = serializers.CharField(
        source="structure.adresse",
        read_only=True,
    )
    structure_telephone = serializers.CharField(
        source="structure.telephone",
        read_only=True,
    )

    class Meta(FactureListSerializer.Meta):
        fields = FactureListSerializer.Meta.fields + [
            "paiement",
            "paiement_mode",
            "lignes",
            "structure_adresse",
            "structure_telephone",
        ]


class VenteSerializer(serializers.ModelSerializer):

    etat_label = serializers.SerializerMethodField()
    prepare_par_nom = serializers.CharField(
        source="prepare_par.nom",
        read_only=True,
    )
    prepare_par_id = serializers.UUIDField(
        source="prepare_par.id",
        read_only=True,
    )
    lignes = LigneVenteSerializer(many=True, read_only=True)
    paiement = PaiementSerializer(read_only=True)
    facture = FactureSerializer(read_only=True)

    class Meta:
        model = Vente
        fields = [
            "id",
            "structure",
            "numero",
            "etat",
            "etat_label",
            "prepare_par",
            "prepare_par_id",
            "prepare_par_nom",
            "cree_le",
            "transmise_le",
            "validee_le",
            "annulee_le",
            "annulee_par",
            "date_expiration",
            "motif_annulation",
            "nom_client",
            "telephone_client",
            "montant_total",
            "nb_articles",
            "lignes",
            "paiement",
            "facture",
        ]
        read_only_fields = ["id"]

    def get_etat_label(self, obj):
        return obj.get_etat_display()


class VenteAvecFactureSerializer(VenteSerializer):
    """Vente enrichie de sa facture, paiement et historique d'impression."""

    total_impressions = serializers.SerializerMethodField()
    structure_nom = serializers.CharField(
        source="structure.nom",
        read_only=True,
    )
    structure_adresse = serializers.CharField(
        source="structure.adresse",
        read_only=True,
    )
    structure_telephone = serializers.CharField(
        source="structure.telephone",
        read_only=True,
    )

    class Meta(VenteSerializer.Meta):
        fields = VenteSerializer.Meta.fields + [
            "structure_nom",
            "structure_adresse",
            "structure_telephone",
            "total_impressions",
        ]

    def get_total_impressions(self, obj):
        from .services import VenteService

        facture = getattr(obj, "facture", None)
        if facture is None:
            return 0
        return VenteService.total_impressions(facture)


class LigneVenteInputSerializer(serializers.Serializer):
    medicament_id = serializers.UUIDField()
    quantite = serializers.IntegerField()


class PaiementCreateSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=ModePaiement.choices)


class AnnulationSerializer(serializers.Serializer):
    motif = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )


class RetourCaisseLigneSerializer(serializers.ModelSerializer):

    class Meta:
        model = RetourCaisseLigne
        fields = [
            "id",
            "medicament",
            "designation",
            "prix_unitaire",
            "quantite",
            "montant",
        ]


class RetourCaisseSerializer(serializers.ModelSerializer):

    motif_label = serializers.SerializerMethodField()
    effectue_par_nom = serializers.CharField(
        source="effectue_par.nom",
        read_only=True,
    )
    vente_numero = serializers.CharField(
        source="vente.numero",
        read_only=True,
    )
    facture_numero = serializers.SerializerMethodField()
    lignes = RetourCaisseLigneSerializer(many=True, read_only=True)

    class Meta:
        model = RetourCaisse
        fields = [
            "id",
            "structure",
            "vente",
            "vente_numero",
            "facture_numero",
            "numero",
            "motif",
            "motif_label",
            "commentaire",
            "effectue_par",
            "effectue_par_nom",
            "effectue_le",
            "montant_total",
            "nb_articles",
            "lignes",
        ]

    def get_motif_label(self, obj):
        return obj.get_motif_display()

    def get_facture_numero(self, obj):
        try:
            return obj.vente.facture.numero
        except Facture.DoesNotExist:
            return None


class OperationCaisseSerializer(serializers.ModelSerializer):

    action_label = serializers.SerializerMethodField()
    resultat_label = serializers.SerializerMethodField()
    utilisateur_nom = serializers.CharField(
        source="utilisateur.nom",
        read_only=True,
    )
    vente_numero = serializers.SerializerMethodField()

    class Meta:
        model = OperationCaisse
        fields = [
            "id",
            "structure",
            "vente",
            "vente_numero",
            "utilisateur",
            "utilisateur_nom",
            "role",
            "action",
            "action_label",
            "resultat",
            "resultat_label",
            "detail",
            "adresse_ip",
            "cree_le",
        ]

    def get_action_label(self, obj):
        return obj.get_action_display()

    def get_resultat_label(self, obj):
        return obj.get_resultat_display()

    def get_vente_numero(self, obj):
        return obj.vente.numero if obj.vente_id else None


class RetourItemInputSerializer(serializers.Serializer):
    ligne_id = serializers.UUIDField()
    quantite = serializers.IntegerField()


class RetourCreateSerializer(serializers.Serializer):
    vente_id = serializers.UUIDField()
    motif = serializers.ChoiceField(choices=MotifRetour.choices)
    commentaire = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )
    items = serializers.ListField(
        child=RetourItemInputSerializer(),
        allow_empty=False,
    )
