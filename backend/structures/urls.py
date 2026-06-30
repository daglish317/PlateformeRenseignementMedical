from django.urls import path

from .views import (
    CreateStructureView,
    AdminListStructuresView,
    ValidateStructureView,
    StructureDetailView,
)

urlpatterns = [
    path("create/", CreateStructureView.as_view(), name="structure-create"),

    path("admin/list/", AdminListStructuresView.as_view(), name="structure-admin-list"),

    path("admin/validate/<uuid:pk>/", ValidateStructureView.as_view(), name="structure-validate"),

    path("<uuid:pk>/", StructureDetailView.as_view(), name="structure-detail"),
]