from django.urls import path

from .views import (
    MyNotificationsView,
    MarkAsReadView,
    DeleteNotificationView,
    AdminSendNotificationView,
    UnreadCountsByNavItemView,
    AdminBroadcastNotificationView,
    AdminTriggerWeeklyReminderView,
    MarkAllAsReadView,
    PushPublicKeyView,
    PushSubscriptionView,
)

urlpatterns = [
    path("", MyNotificationsView.as_view()),
    path("unread-counts/", UnreadCountsByNavItemView.as_view(), name="unread-counts"),
    path("read/<uuid:pk>/", MarkAsReadView.as_view()),
    path("read-all/", MarkAllAsReadView.as_view()),
    path("delete/<uuid:pk>/", DeleteNotificationView.as_view()),
    path("admin/send/", AdminSendNotificationView.as_view()),
    path("admin/broadcast/", AdminBroadcastNotificationView.as_view()),
    path("admin/weekly-reminder/", AdminTriggerWeeklyReminderView.as_view()),
    path("push/public-key/", PushPublicKeyView.as_view()),
    path("push/subscription/", PushSubscriptionView.as_view()),
]
