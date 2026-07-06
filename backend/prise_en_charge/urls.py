from django.urls import path

from .views import (
    CreatePriseEnChargeView,
    ListPriseEnChargeStructureView,
    AdminListPriseEnChargeView,
)

urlpatterns = [
    path("create/", CreatePriseEnChargeView.as_view()),
    path("structure/<uuid:structure_id>/", ListPriseEnChargeStructureView.as_view()),
    path("admin/list/", AdminListPriseEnChargeView.as_view()),
]