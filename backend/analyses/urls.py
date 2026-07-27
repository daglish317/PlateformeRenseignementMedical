from django.urls import path

from .views import AnalysesByStructureView

urlpatterns = [
    path("structure/<uuid:structure_id>/", AnalysesByStructureView.as_view()),
]
