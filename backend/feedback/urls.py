from django.urls import path

from .views import (
    CreateFeedbackView,
    StructureFeedbackListView,
    FeedbackStatsView,
    DeleteFeedbackView,
)

urlpatterns = [
    path("create/", CreateFeedbackView.as_view()),
    path("structure/<uuid:structure_id>/", StructureFeedbackListView.as_view()),
    path("admin/stats/", FeedbackStatsView.as_view()),
    path("admin/<uuid:pk>/delete/", DeleteFeedbackView.as_view()),
]
