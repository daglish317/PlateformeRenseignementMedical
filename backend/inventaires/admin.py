from django.contrib import admin

from .models import Inventaire, InventaireLigne


class InventaireLigneInline(admin.TabularInline):
    model = InventaireLigne
    extra = 0
    readonly_fields = [
        "medicament",
        "nom",
        "forme_pharmaceutique",
        "quantite_physique",
        "quantite_reservee",
        "quantite_disponible",
        "seuil_alerte",
        "statut",
    ]
    can_delete = False


@admin.register(Inventaire)
class InventaireAdmin(admin.ModelAdmin):
    list_display = [
        "numero",
        "structure",
        "cree_par",
        "role_createur",
        "cree_le",
    ]
    list_filter = ["structure", "cree_le"]
    search_fields = ["numero", "structure__nom", "cree_par__nom"]
    readonly_fields = ["numero", "cree_par", "role_createur", "cree_le"]
    inlines = [InventaireLigneInline]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
