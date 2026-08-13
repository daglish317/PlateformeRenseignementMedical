from django.urls import path

from .views import (
    ApprovisionnementDetailView,
    ApprovisionnementExcelView,
    ApprovisionnementListCreateView,
    ApprovisionnementPDFView,
    CreateStockView,
    DeleteStockView,
    EntreeStockView,
    ImportMedicamentView,
    ImportStockView,
    ListStockStructureView,
    MedicamentListView,
    ProduitsPeremptionView,
    RetirerStockView,
    StockAlertesView,
    StockMovementsView,
)

urlpatterns = [
    path("medicaments/", MedicamentListView.as_view()),
    path("approvisionnements/", ApprovisionnementListCreateView.as_view()),
    path("approvisionnements/<uuid:pk>/", ApprovisionnementDetailView.as_view()),
    path("approvisionnements/<uuid:pk>/export/pdf/", ApprovisionnementPDFView.as_view()),
    path("approvisionnements/<uuid:pk>/export/excel/", ApprovisionnementExcelView.as_view()),
    path("create/", CreateStockView.as_view()),
    path("structure/<uuid:structure_id>/", ListStockStructureView.as_view()),
    path("structure/<uuid:structure_id>/peremption/", ProduitsPeremptionView.as_view()),
    path("<uuid:pk>/delete/", DeleteStockView.as_view()),
    path("<uuid:pk>/entree/", EntreeStockView.as_view()),
    path("<uuid:pk>/retirer/", RetirerStockView.as_view()),
    path("<uuid:pk>/mouvements/", StockMovementsView.as_view()),
    path("structure/<uuid:structure_id>/alertes/", StockAlertesView.as_view()),
    path("import/", ImportStockView.as_view()),
    path("import/medicaments/", ImportMedicamentView.as_view()),
]
