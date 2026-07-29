from django.contrib import admin

from .models import PriseEnCharge


@admin.register(PriseEnCharge)
class PriseEnChargeAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "service__nom",
    )

    list_display = (
        "service",
        "structure",
        "niveau",
        "date_ajout",
    )

    list_filter = (
        "structure",
        "niveau",
    )

    search_fields = (
        "service__nom",
        "structure__nom",
        "niveau",
    )

    readonly_fields = (
        "id",
        "date_ajout",
    )

    list_select_related = (
        "structure",
        "service",
    )

    fieldsets = (
        (
            "Prise en charge",
            {
                "fields": (
                    "id",
                    "structure",
                    "service",
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