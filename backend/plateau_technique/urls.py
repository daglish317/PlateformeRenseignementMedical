from django.urls import path

from .views import (
    CreatePlateauTechniqueView,
    ListPlateauStructureView,
    AdminListPlateauView,
    DeactivatePlateauView,
)

urlpatterns = [
    path("create/", CreatePlateauTechniqueView.as_view()),
    path("structure/<uuid:structure_id>/", ListPlateauStructureView.as_view()),
    path("admin/list/", AdminListPlateauView.as_view()),
    path("<uuid:pk>/deactivate/", DeactivatePlateauView.as_view()),
]
