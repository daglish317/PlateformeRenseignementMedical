from django.urls import path

from .views import AnalysesByStructureView, ImportAnalysesView

urlpatterns = [
    path("structure/<uuid:structure_id>/", AnalysesByStructureView.as_view()),
    path("import/", ImportAnalysesView.as_view()),
]
