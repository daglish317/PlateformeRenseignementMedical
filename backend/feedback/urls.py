from django.urls import path

from .views import (
    CreateFeedbackView,
    UpdateFeedbackView,
    AdminListFeedbackView,
    AdminStructureFeedbackView,
    FeedbackStatsView,
    DeleteFeedbackView,
)

urlpatterns = [
    path("create/", CreateFeedbackView.as_view()),
    path("<uuid:pk>/update/", UpdateFeedbackView.as_view()),
    path("admin/list/", AdminListFeedbackView.as_view()),
    path("admin/structure/<uuid:structure_id>/", AdminStructureFeedbackView.as_view()),
    path("admin/stats/", FeedbackStatsView.as_view()),
    path("admin/<uuid:pk>/delete/", DeleteFeedbackView.as_view()),
]
