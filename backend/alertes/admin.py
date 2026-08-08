from django.contrib import admin

from .models import Alerte


@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = [
        "titre",
        "type",
        "categorie",
        "priorite",
        "module",
        "structure",
        "est_resolue",
        "cree_le",
    ]
    list_filter = ["type", "categorie", "priorite", "est_resolue", "structure"]
    search_fields = [
        "titre",
        "description",
        "structure__nom",
        "texte_recherche",
        "utilisateur_concerne__nom",
    ]
    readonly_fields = [
        "structure",
        "categorie",
        "type",
        "priorite",
        "module",
        "titre",
        "description",
        "utilisateur_concerne",
        "donnees",
        "est_resolue",
        "cree_le",
        "texte_recherche",
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
