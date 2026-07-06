from django.contrib import admin

from .models import PriseEnCharge


@admin.register(PriseEnCharge)
class PriseEnChargeAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "catalogue__nom",
    )

    list_display = (
        "catalogue",
        "structure",
        "niveau",
        "date_ajout",
    )

    list_filter = (
        "structure",
        "niveau",
    )

    search_fields = (
        "catalogue__nom",
        "structure__nom",
        "niveau",
    )

    readonly_fields = (
        "id",
        "date_ajout",
    )

    list_select_related = (
        "structure",
        "catalogue",
    )

    fieldsets = (
        (
            "Prise en charge",
            {
                "fields": (
                    "id",
                    "structure",
                    "catalogue",
                    "niveau",
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