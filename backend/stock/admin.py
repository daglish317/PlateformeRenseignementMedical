from django.contrib import admin

from .models import StockItem


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
        "date_ajout",
    )

    list_editable = (
        "quantite",
        "disponible",
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

