from django.urls import path

from .views import (
    ConversationView,
    SendMessageView,
    MarkMessageReadView
)

urlpatterns = [
    path("conversation/<uuid:structure_id>/", ConversationView.as_view()),
    path("send/<uuid:conversation_id>/", SendMessageView.as_view()),
    path("read/<uuid:pk>/", MarkMessageReadView.as_view()),
]