from django.contrib import admin

from .models import (
    Facture,
    ImpressionFacture,
    LigneVente,
    OperationCaisse,
    Paiement,
    RetourCaisse,
    RetourCaisseLigne,
    Vente,
)


class LigneVenteInline(admin.TabularInline):
    model = LigneVente
    extra = 0
    readonly_fields = ["designation", "prix_unitaire", "quantite", "montant", "tva"]


class RetourCaisseLigneInline(admin.TabularInline):
    model = RetourCaisseLigne
    extra = 0
    readonly_fields = ["designation", "prix_unitaire", "quantite", "montant"]


class ImpressionFactureInline(admin.TabularInline):
    model = ImpressionFacture
    extra = 0
    readonly_fields = ["imprime_par", "imprime_le"]


@admin.register(Vente)
class VenteAdmin(admin.ModelAdmin):
    list_display = ["numero", "structure", "etat", "montant_total", "prepare_par", "cree_le"]
    list_filter = ["etat", "structure"]
    search_fields = ["numero", "nom_client", "telephone_client"]
    readonly_fields = ["numero"]
    inlines = [LigneVenteInline]


@admin.register(Paiement)
class PaiementAdmin(admin.ModelAdmin):
    list_display = ["vente", "mode", "montant", "encaisse_par", "effectue_le"]


@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ["numero", "vente", "montant_total", "cree_le"]
    inlines = [ImpressionFactureInline]


@admin.register(ImpressionFacture)
class ImpressionFactureAdmin(admin.ModelAdmin):
    list_display = ["facture", "imprime_par", "imprime_le"]
    readonly_fields = ["facture", "imprime_par", "imprime_le"]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RetourCaisse)
class RetourCaisseAdmin(admin.ModelAdmin):
    list_display = ["numero", "vente", "motif", "montant_total", "effectue_par", "effectue_le"]
    readonly_fields = ["vente", "effectue_par", "effectue_le", "numero"]
    inlines = [RetourCaisseLigneInline]


@admin.register(OperationCaisse)
class OperationCaisseAdmin(admin.ModelAdmin):
    """Journal d'audit : aucune entrée ne peut être ajoutée ni supprimée."""

    list_display = ["action", "utilisateur", "role", "resultat", "cree_le"]
    list_filter = ["action", "resultat", "role"]
    readonly_fields = [
        "structure",
        "vente",
        "utilisateur",
        "role",
        "action",
        "resultat",
        "detail",
        "adresse_ip",
        "cree_le",
    ]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
