from rest_framework import serializers
from .models import Notification, PushSubscription


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


class PushSubscriptionSerializer(serializers.Serializer):
    endpoint = serializers.URLField()
    expirationTime = serializers.JSONField(required=False, allow_null=True)
    keys = serializers.DictField()

    def validate_keys(self, value):
        if not value.get("p256dh") or not value.get("auth"):
            raise serializers.ValidationError("Clés push invalides.")
        return value


class PushSubscriptionResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = PushSubscription
        fields = [
            "id",
            "endpoint",
            "est_active",
            "date_creation",
        ]
        read_only_fields = fields
