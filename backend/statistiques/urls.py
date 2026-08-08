from django.urls import path

from .views import (
    AnalyseApprovisionnementsView,
    AnalyseCaisseView,
    AnalyseFinanciereView,
    AnalyseStockView,
    AnalyseVentesView,
    ComparaisonPeriodesView,
    DetailsStatistiquesView,
    ProduitsVendusView,
    StatistiquesExcelView,
    StatistiquesPDFView,
    VueGeneraleView,
)

urlpatterns = [
    path("generale/", VueGeneraleView.as_view(), name="statistiques-generale"),
    path("ventes/", AnalyseVentesView.as_view(), name="statistiques-ventes"),
    path("produits/", ProduitsVendusView.as_view(), name="statistiques-produits"),
    path(
        "approvisionnements/",
        AnalyseApprovisionnementsView.as_view(),
        name="statistiques-approvisionnements",
    ),
    path("stock/", AnalyseStockView.as_view(), name="statistiques-stock"),
    path("caisse/", AnalyseCaisseView.as_view(), name="statistiques-caisse"),
    path("financier/", AnalyseFinanciereView.as_view(), name="statistiques-financier"),
    path("comparaison/", ComparaisonPeriodesView.as_view(), name="statistiques-comparaison"),
    path("details/", DetailsStatistiquesView.as_view(), name="statistiques-details"),
    path(
        "exporter/pdf/",
        StatistiquesPDFView.as_view(),
        name="statistiques-pdf",
    ),
    path(
        "exporter/excel/",
        StatistiquesExcelView.as_view(),
        name="statistiques-excel",
    ),
]
