from django.contrib import admin

from .models import PlateauTechnique


@admin.register(PlateauTechnique)
class PlateauTechniqueAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "service__nom",
    )

    list_display = (
        "service",
        "structure",
        "disponible",
        "date_ajout",
    )

    list_filter = (
        "disponible",
        "structure",
    )

    search_fields = (
        "service__nom",
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
        "service",
    )

    fieldsets = (
        (
            "Plateau technique",
            {
                "fields": (
                    "id",
                    "structure",
                    "service",
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
