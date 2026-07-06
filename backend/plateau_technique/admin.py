from django.contrib import admin

from .models import PlateauTechnique


@admin.register(PlateauTechnique)
class PlateauTechniqueAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "catalogue__nom",
    )

    list_display = (
        "catalogue",
        "structure",
        "disponible",
        "date_ajout",
    )

    list_filter = (
        "disponible",
        "structure",
    )

    search_fields = (
        "catalogue__nom",
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "date_ajout",
    )

    list_editable = (
        "disponible",
    )

    list_select_related = (
        "structure",
        "catalogue",
    )

    fieldsets = (
        (
            "Plateau technique",
            {
                "fields": (
                    "id",
                    "structure",
                    "catalogue",
                )
            },
        ),
        (
            "Disponibilité",
            {
                "fields": (
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
