from django.urls import path

from .views import (
    CreateStockView,
    ListStockStructureView,
    RetirerStockView,
    EntreeStockView,
    StockMovementsView,
    StockAlertesView,
)

urlpatterns = [
    path("create/", CreateStockView.as_view()),
    path("structure/<uuid:structure_id>/", ListStockStructureView.as_view()),
    path("<uuid:pk>/retirer/", RetirerStockView.as_view()),
    path("<uuid:pk>/entree/", EntreeStockView.as_view()),
    path("<uuid:pk>/mouvements/", StockMovementsView.as_view()),
    path("structure/<uuid:structure_id>/alertes/", StockAlertesView.as_view()),
]
