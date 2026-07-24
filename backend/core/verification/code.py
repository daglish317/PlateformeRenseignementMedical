import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta


class VerificationCode(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    email = models.EmailField(db_index=True)

    code = models.CharField(max_length=4)

    is_used = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    expires_at = models.DateTimeField()

    def is_valid(self):
        return (
            not self.is_used
            and timezone.now() < self.expires_at
        )

    @staticmethod
    def generate_expiry():
        return timezone.now() + timedelta(hours=24)