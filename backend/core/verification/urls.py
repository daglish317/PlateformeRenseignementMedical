from django.urls import path
from .api import SendVerificationCode, ConfirmVerificationCode

urlpatterns = [
    path("send/", SendVerificationCode.as_view()),
    path("confirm/", ConfirmVerificationCode.as_view()),
]