from django.contrib import admin
from .models import Structure, Favori, Horaire


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


@admin.register(Favori)
class FavoriAdmin(admin.ModelAdmin):

    ordering = ("-date_ajout",)

    list_display = (
        "utilisateur",
        "structure",
        "date_ajout",
    )

    list_filter = (
        "date_ajout",
    )

    search_fields = (
        "utilisateur__nom",
        "utilisateur__email",
        "structure__nom",
    )

    list_select_related = (
        "utilisateur",
        "structure",
    )


@admin.register(Horaire)
class HoraireAdmin(admin.ModelAdmin):

    ordering = ("structure", "jour")

    list_display = (
        "structure",
        "jour",
        "heure_ouverture",
        "heure_fermeture",
        "est_ferme",
    )

    list_filter = (
        "jour",
        "est_ferme",
    )

    search_fields = (
        "structure__nom",
    )

    list_select_related = (
        "structure",
    )