import uuid

from django.db import models


class SearchLog(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=255, db_index=True)
    user_lat = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    user_lon = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    results_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
