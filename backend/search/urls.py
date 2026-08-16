from django.urls import path
from .views import (
    UnifiedSearchAPIView,
    LiveSearchAPIView,
    SearchSuggestionsAPIView,
    SearchHistoryAPIView,
    ReindexAPIView,
)
from .views_public import (
    PublicPharmacySearchView,
    PublicSuggestionsView,
)

urlpatterns = [
    # Recherche unifiée principale (Exigences #1-#17)
    path('unified/', UnifiedSearchAPIView.as_view(), name='unified-search'),

    # Moteur public — médicament → pharmacies ouvertes (spec moteurRecherche.md)
    path('public/pharmacies/', PublicPharmacySearchView.as_view(), name='public-pharmacy-search'),
    path('public/suggestions/', PublicSuggestionsView.as_view(), name='public-suggestions'),

    # Live search pour autocomplétion (Exigence #2)
    path('live/', LiveSearchAPIView.as_view(), name='live-search'),
    
    # Suggestions intelligentes (Exigence #6)
    path('suggestions/', SearchSuggestionsAPIView.as_view(), name='search-suggestions'),
    
    # Historique utilisateur (Exigence #10)
    path('history/', SearchHistoryAPIView.as_view(), name='search-history'),
    
    # Réindexation admin (Exigence #14)
    path('reindex/', ReindexAPIView.as_view(), name='reindex'),
    
    # Backward compatibility - old endpoint
    path('', UnifiedSearchAPIView.as_view(), name='search'),
]