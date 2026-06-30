from django.urls import path
from .views import MyNotificationsView, MarkAsReadView

urlpatterns = [
    path("", MyNotificationsView.as_view()),
    path("read/<uuid:pk>/", MarkAsReadView.as_view()),
]