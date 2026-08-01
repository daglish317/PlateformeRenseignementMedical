from django.contrib import admin
from .models import SearchLog, SearchIndex, SearchSynonym, IntentPattern


@admin.register(SearchLog)
class SearchLogAdmin(admin.ModelAdmin):
    list_display = ['query', 'search_type', 'results_count', 'user', 'created_at']
    list_filter = ['search_type', 'created_at']
    search_fields = ['query']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(SearchIndex)
class SearchIndexAdmin(admin.ModelAdmin):
    list_display = ['content_original', 'search_type', 'structure_nom', 'is_available', 'updated_at']
    list_filter = ['search_type', 'is_available', 'structure_type', 'structure_statut']
    search_fields = ['content', 'content_original', 'structure_nom']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'updated_at'
    
    fieldsets = (
        ('Contenu', {
            'fields': ('content', 'content_original', 'search_type')
        }),
        ('Source', {
            'fields': ('content_type', 'object_id')
        }),
        ('Structure', {
            'fields': ('structure_id', 'structure_nom', 'structure_type', 'structure_adresse', 
                      'structure_telephone', 'structure_latitude', 'structure_longitude', 'structure_statut')
        }),
        ('Disponibilité', {
            'fields': ('is_available', 'quantity')
        }),
        ('Métadonnées', {
            'fields': ('metadata', 'created_at', 'updated_at')
        }),
    )


@admin.register(SearchSynonym)
class SearchSynonymAdmin(admin.ModelAdmin):
    list_display = ['term', 'category', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['term']
    readonly_fields = ['created_at']
    
    fieldsets = (
        (None, {
            'fields': ('term', 'category', 'is_active')
        }),
        ('Synonymes', {
            'fields': ('synonyms',),
            'description': 'Liste des synonymes au format JSON. Ex: ["synonyme1", "synonyme2"]'
        }),
    )


@admin.register(IntentPattern)
class IntentPatternAdmin(admin.ModelAdmin):
    list_display = ['pattern', 'intent_type', 'target_search_type', 'priority', 'is_active']
    list_filter = ['intent_type', 'is_active']
    search_fields = ['pattern']
    ordering = ['-priority', 'pattern']
    
    fieldsets = (
        (None, {
            'fields': ('pattern', 'priority', 'is_active')
        }),
        ('Configuration', {
            'fields': ('intent_type', 'target_search_type'),
            'description': 'Définit comment ce pattern affecte la recherche'
        }),
    )

