from django.urls import path

from .views import (
    CreateServiceMedicalView,
    ListServiceStructureView,
    AdminListServiceMedicalView,
    DeactivateServiceMedicalView,
)

urlpatterns = [
    path("create/", CreateServiceMedicalView.as_view()),
    path("structure/<uuid:structure_id>/", ListServiceStructureView.as_view()),
    path("admin/list/", AdminListServiceMedicalView.as_view()),
    path("<uuid:pk>/deactivate/", DeactivateServiceMedicalView.as_view()),
]
