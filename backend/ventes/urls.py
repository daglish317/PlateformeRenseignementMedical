from django.urls import path

from .facture_views import (
    FactureDetailModuleView,
    FactureListView,
    FacturePDFView,
    GenererFactureView,
    VentesEligiblesFactureView,
)
from .views import (
    AjouterLigneVenteView,
    AnnulerVenteCaisseView,
    AnnulerVenteView,
    CreerVenteView,
    EnvoyerVenteCaisseView,
    FactureDetailView,
    HistoriqueVentesView,
    ImprimerFactureView,
    ModifierLigneVenteView,
    OperationCaisseHistoriqueView,
    OuvrirVenteCaisseView,
    PaiementsRealisesView,
    ReceptionPDFView,
    RetoursCaisseView,
    SupprimerLigneVenteView,
    ValiderPaiementView,
    VenteCaisseDetailView,
    VentePreparationView,
    VenteStatistiquesView,
    VentesCaisseAttenteView,
)

urlpatterns = [
    # Gestionnaire — préparation
    path("", CreerVenteView.as_view(), name="vente-creer"),
    path("preparation/", VentePreparationView.as_view(), name="vente-preparation"),
    path("<uuid:pk>/lignes/", AjouterLigneVenteView.as_view(), name="vente-ajouter-ligne"),
    path(
        "<uuid:pk>/lignes/<uuid:ligne_id>/",
        ModifierLigneVenteView.as_view(),
        name="vente-modifier-ligne",
    ),
    path(
        "<uuid:pk>/lignes/<uuid:ligne_id>/supprimer/",
        SupprimerLigneVenteView.as_view(),
        name="vente-supprimer-ligne",
    ),
    path("<uuid:pk>/envoyer-caisse/", EnvoyerVenteCaisseView.as_view(), name="vente-envoyer-caisse"),
    path("<uuid:pk>/annuler/", AnnulerVenteView.as_view(), name="vente-annuler"),
    path("historique/", HistoriqueVentesView.as_view(), name="vente-historique"),
    path("statistiques/", VenteStatistiquesView.as_view(), name="vente-statistiques"),
    # Caissier — encaissement
    path("caisse/attente/", VentesCaisseAttenteView.as_view(), name="vente-caisse-attente"),
    path("caisse/paiements/", PaiementsRealisesView.as_view(), name="vente-caisse-paiements"),
    path("caisse/retours/", RetoursCaisseView.as_view(), name="vente-caisse-retours"),
    path("caisse/historique/", OperationCaisseHistoriqueView.as_view(), name="vente-caisse-historique"),
    path("caisse/<uuid:pk>/", VenteCaisseDetailView.as_view(), name="vente-caisse-detail"),
    path("caisse/<uuid:pk>/ouvrir/", OuvrirVenteCaisseView.as_view(), name="vente-caisse-ouvrir"),
    path("caisse/<uuid:pk>/paiement/", ValiderPaiementView.as_view(), name="vente-paiement"),
    path("caisse/<uuid:pk>/annuler/", AnnulerVenteCaisseView.as_view(), name="vente-caisse-annuler"),
    path("caisse/<uuid:pk>/facture/", FactureDetailView.as_view(), name="vente-facture"),
    path(
        "caisse/<uuid:pk>/facture/imprimer/",
        ImprimerFactureView.as_view(),
        name="vente-facture-imprimer",
    ),
    path(
        "caisse/<uuid:pk>/reception/pdf/",
        ReceptionPDFView.as_view(),
        name="vente-reception-pdf",
    ),
    # Module Facture
    path("factures/", FactureListView.as_view(), name="facture-liste"),
    path(
        "factures/ventes-disponibles/",
        VentesEligiblesFactureView.as_view(),
        name="facture-ventes-eligibles",
    ),
    path("factures/generer/", GenererFactureView.as_view(), name="facture-generer"),
    path("factures/<uuid:pk>/", FactureDetailModuleView.as_view(), name="facture-detail"),
    path(
        "factures/<uuid:pk>/pdf/",
        FacturePDFView.as_view(),
        name="facture-pdf",
    ),
]
