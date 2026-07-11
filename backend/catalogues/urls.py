from django.urls import path

from .views import (
    CatalogueListView,
    CatalogueDetailView,
    CatalogueCreateView,
    CatalogueUpdateView,
    CatalogueDeleteView,
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
        "delete/<uuid:pk>/",
        CatalogueDeleteView.as_view(),
        name="catalogue-delete",
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