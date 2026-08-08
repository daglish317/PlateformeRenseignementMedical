from django.contrib import admin

from .models import EvenementHistorique


@admin.register(EvenementHistorique)
class EvenementHistoriqueAdmin(admin.ModelAdmin):
    list_display = [
        "type",
        "structure",
        "utilisateur",
        "role",
        "cree_le",
    ]
    list_filter = ["type", "structure", "cree_le"]
    search_fields = [
        "structure__nom",
        "utilisateur__nom",
        "type",
        "texte_recherche",
    ]
    readonly_fields = [
        "structure",
        "type",
        "utilisateur",
        "role",
        "cree_le",
        "donnees",
        "texte_recherche",
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
