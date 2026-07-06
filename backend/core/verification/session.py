import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta


class VerificationSession(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(db_index=True)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField()

    @staticmethod
    def generate_expiry():
        return timezone.now() + timedelta(minutes=30)