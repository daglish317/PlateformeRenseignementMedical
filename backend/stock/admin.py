from django.contrib import admin

from .models import (
    Approvisionnement,
    LigneApprovisionnement,
    Medicament,
    StockItem,
    StockMovement,
)


@admin.register(StockItem)
class StockItemAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "nom",
    )

    list_display = (
        "nom",
        "type_item",
        "structure",
        "quantite",
        "disponible",
        "date_ajout",
    )

    list_filter = (
        "type_item",
        "disponible",
        "structure",
    )

    search_fields = (
        "nom",
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "quantite",
        "quantite_reservee",
        "date_ajout",
    )

    list_select_related = (
        "structure",
    )

    fieldsets = (
        (
            "Informations générales",
            {
                "fields": (
                    "id",
                    "structure",
                    "nom",
                    "type_item",
                )
            },
        ),
        (
            "Stock",
            {
                "fields": (
                    "quantite",
                    "quantite_reservee",
                    "seuil_alerte",
                    "disponible",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "date_ajout",
                )
            },
        ),
    )


@admin.register(Medicament)
class MedicamentAdmin(admin.ModelAdmin):

    list_display = (
        "nom",
        "forme_pharmaceutique",
        "prix_vente",
        "tva",
        "en_reserve",
        "structure",
        "date_modification",
    )

    list_filter = (
        "forme_pharmaceutique",
        "tva",
        "en_reserve",
        "structure",
    )

    search_fields = (
        "nom",
        "structure__nom",
    )

    list_select_related = ("structure",)


class LigneApprovisionnementInline(admin.TabularInline):

    model = LigneApprovisionnement
    extra = 0
    readonly_fields = (
        "medicament",
        "forme_pharmaceutique",
        "quantite",
        "prix_achat",
        "prix_vente",
        "date_peremption",
        "tva",
        "en_reserve",
    )
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Approvisionnement)
class ApprovisionnementAdmin(admin.ModelAdmin):

    list_display = (
        "date_reception",
        "fournisseur",
        "reference_bon",
        "structure",
        "cree_par",
        "cree_le",
    )

    list_filter = (
        "structure",
        "date_reception",
    )

    search_fields = (
        "fournisseur",
        "reference_bon",
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "structure",
        "date_reception",
        "fournisseur",
        "reference_bon",
        "cree_par",
        "cree_le",
    )

    inlines = (LigneApprovisionnementInline,)

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):

    list_display = (
        "item",
        "type_mouvement",
        "quantite",
        "motif",
        "created_at",
    )
    list_filter = (
        "type_mouvement",
        "created_at",
        "item__structure",
    )
    search_fields = (
        "item__nom",
        "motif",
        "approvisionnement__reference_bon",
    )
    readonly_fields = (
        "id",
        "item",
        "type_mouvement",
        "quantite",
        "motif",
        "approvisionnement",
        "created_at",
    )
    list_select_related = (
        "item",
        "item__structure",
        "approvisionnement",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
