from django.urls import path

from .views import (
    ConversationView,
    SendMessageView,
    MarkMessageReadView,
    DeleteMessageView,
    ListConversationsView,
    UnreadCountView,
)

urlpatterns = [
    path("conversations/", ListConversationsView.as_view(), name="conversations-list"),
    path("unread-count/", UnreadCountView.as_view(), name="unread-count"),
    path("conversation/<uuid:structure_id>/", ConversationView.as_view(), name="conversation-detail"),
    path("send/<uuid:conversation_id>/", SendMessageView.as_view(), name="send-message"),
    path("read/<uuid:pk>/", MarkMessageReadView.as_view(), name="mark-read"),
    path("delete/<uuid:pk>/", DeleteMessageView.as_view(), name="delete-message"),
]