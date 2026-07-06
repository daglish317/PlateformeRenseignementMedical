from django.urls import path

from .views import (
    CreateAvisView,
    AddCommentaireView,
    UpdateCommentaireView,
    DeleteCommentaireView
)

urlpatterns = [
    path("create/", CreateAvisView.as_view()),
    path("comment/add/", AddCommentaireView.as_view()),
    path("comment/<uuid:pk>/update/", UpdateCommentaireView.as_view()),
    path("comment/<uuid:pk>/delete/", DeleteCommentaireView.as_view()),
]