from django.contrib import admin

from .models import Catalogue


@admin.register(Catalogue)
class CatalogueAdmin(admin.ModelAdmin):

    ordering = (
        "type",
        "nom",
    )

    list_display = (
        "nom",
        "type",
        "est_actif",
        "date_creation",
        "date_modification",
    )

    list_filter = (
        "type",
        "est_actif",
        "date_creation",
    )

    search_fields = (
        "nom",
        "description",
    )

    readonly_fields = (
        "id",
        "date_creation",
        "date_modification",
    )

    list_editable = (
        "est_actif",
    )

    fieldsets = (
        (
            "Informations générales",
            {
                "fields": (
                    "id",
                    "nom",
                    "type",
                    "description",
                )
            },
        ),
        (
            "État",
            {
                "fields": (
                    "est_actif",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "date_creation",
                    "date_modification",
                )
            },
        ),
    )