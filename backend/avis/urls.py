from django.urls import path

from .views import (
    CreateAvisView,
    UpdateAvisView,
    DeleteAvisView,
    ListAvisStructureView,
    AddCommentaireView,
    UpdateCommentaireView,
    DeleteCommentaireView,
)

urlpatterns = [
    path("create/", CreateAvisView.as_view()),
    path("<uuid:pk>/update/", UpdateAvisView.as_view()),
    path("<uuid:pk>/delete/", DeleteAvisView.as_view()),
    path("structure/<uuid:structure_id>/", ListAvisStructureView.as_view()),
    path("comment/add/", AddCommentaireView.as_view()),
    path("comment/<uuid:pk>/update/", UpdateCommentaireView.as_view()),
    path("comment/<uuid:pk>/delete/", DeleteCommentaireView.as_view()),
]