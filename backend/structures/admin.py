from django.contrib import admin
from .models import Structure


@admin.register(Structure)
class StructureAdmin(admin.ModelAdmin):

    ordering = ("-date_creation",)

    list_display = (
        "nom",
        "type",
        "statut",
        "gestionnaire",
        "telephone",
        "date_creation",
        "date_validation",
        "valide_par",
    )

    list_filter = (
        "type",
        "statut",
        "date_creation",
    )

    search_fields = (
        "nom",
        "adresse",
        "telephone",
        "gestionnaire__nom",
        "gestionnaire__email",
    )

    readonly_fields = (
        "id",
        "date_creation",
        "date_validation",
        "valide_par",
        "motif_refus",
    )

    list_select_related = (
        "gestionnaire",
        "valide_par",
    )

    fieldsets = (
        ("Infos générales", {
            "fields": (
                "id",
                "nom",
                "type",
                "photo",
            )
        }),
        ("Localisation", {
            "fields": (
                "adresse",
                "telephone",
                "latitude",
                "longitude",
            )
        }),
        ("État système", {
            "fields": (
                "statut",
                "gestionnaire",
                "valide_par",
                "motif_refus",
            )
        }),
        ("Dates", {
            "fields": (
                "date_creation",
                "date_validation",
            )
        }),
    )