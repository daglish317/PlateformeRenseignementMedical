from django.urls import path

from .views import (
    AlertesExcelView,
    AlertesPDFView,
    DetailAlerteView,
    ListeAlertesView,
    MarquerLueAlerteView,
    ResumeAlertesView,
)

urlpatterns = [
    path("", ListeAlertesView.as_view(), name="alertes-liste"),
    path("resume/", ResumeAlertesView.as_view(), name="alertes-resume"),
    path("exporter/pdf/", AlertesPDFView.as_view(), name="alertes-pdf"),
    path("exporter/excel/", AlertesExcelView.as_view(), name="alertes-excel"),
    path("<uuid:pk>/", DetailAlerteView.as_view(), name="alertes-detail"),
    path(
        "<uuid:pk>/marquer-lue/",
        MarquerLueAlerteView.as_view(),
        name="alertes-marquer-lue",
    ),
]
