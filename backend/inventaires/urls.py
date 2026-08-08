from django.urls import path

from .views import (
    DetailInventaireView,
    GenererInventaireView,
    InventaireExcelView,
    InventairePDFView,
    ListeInventairesView,
)

urlpatterns = [
    path("", ListeInventairesView.as_view(), name="inventaire-liste"),
    path("generer/", GenererInventaireView.as_view(), name="inventaire-generer"),
    path("<uuid:pk>/", DetailInventaireView.as_view(), name="inventaire-detail"),
    path("<uuid:pk>/pdf/", InventairePDFView.as_view(), name="inventaire-pdf"),
    path("<uuid:pk>/excel/", InventaireExcelView.as_view(), name="inventaire-excel"),
]
