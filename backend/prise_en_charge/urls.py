from django.urls import path

from .views import (
    CreatePriseEnChargeView,
    UpdatePriseEnChargeView,
    DeletePriseEnChargeView,
    ListPriseEnChargeStructureView,
    AdminListPriseEnChargeView,
    ImportPriseEnChargeView,
)

urlpatterns = [
    path("create/", CreatePriseEnChargeView.as_view()),
    path("<uuid:pk>/update/", UpdatePriseEnChargeView.as_view()),
    path("<uuid:pk>/delete/", DeletePriseEnChargeView.as_view()),
    path("structure/<uuid:structure_id>/", ListPriseEnChargeStructureView.as_view()),
    path("admin/list/", AdminListPriseEnChargeView.as_view()),
    path("import/", ImportPriseEnChargeView.as_view()),
]