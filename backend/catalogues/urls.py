from django.urls import path

from .views import (
    CatalogueListView,
    CatalogueDetailView,
    CatalogueCreateView,
    CatalogueUpdateView,
    CatalogueActiverView,
    CatalogueDesactiverView,
)

urlpatterns = [
    path("", CatalogueListView.as_view(), name="catalogue-list"),

    path("<uuid:pk>/", CatalogueDetailView.as_view(), name="catalogue-detail"),

    path(
        "create/",
        CatalogueCreateView.as_view(),
        name="catalogue-create",
    ),

    path(
        "update/<uuid:pk>/",
        CatalogueUpdateView.as_view(),
        name="catalogue-update",
    ),

    path(
        "activate/<uuid:pk>/",
        CatalogueActiverView.as_view(),
        name="catalogue-activate",
    ),

    path(
        "deactivate/<uuid:pk>/",
        CatalogueDesactiverView.as_view(),
        name="catalogue-deactivate",
    ),
]