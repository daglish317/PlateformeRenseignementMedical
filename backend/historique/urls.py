from django.urls import path

from .views import (
    DetailEvenementHistoriqueView,
    HistoriqueExcelView,
    HistoriquePDFView,
    ListeHistoriqueView,
    ResumeHistoriqueView,
)

urlpatterns = [
    path("", ListeHistoriqueView.as_view(), name="historique-liste"),
    path("resume/", ResumeHistoriqueView.as_view(), name="historique-resume"),
    path("exporter/pdf/", HistoriquePDFView.as_view(), name="historique-pdf"),
    path("exporter/excel/", HistoriqueExcelView.as_view(), name="historique-excel"),
    path("<uuid:pk>/", DetailEvenementHistoriqueView.as_view(), name="historique-detail"),
]
