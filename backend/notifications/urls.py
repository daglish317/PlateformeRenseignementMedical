from django.urls import path

from .views import MyNotificationsView, MarkAsReadView, AdminSendNotificationView

urlpatterns = [
    path("", MyNotificationsView.as_view()),
    path("read/<uuid:pk>/", MarkAsReadView.as_view()),
    path("admin/send/", AdminSendNotificationView.as_view()),
]
