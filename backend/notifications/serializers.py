from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notification
        fields = [
            "id",
            "titre",
            "message",
            "type",
            "nav_item",
            "est_lue",
            "date_creation",
            "structure",
        ]
        read_only_fields = fields