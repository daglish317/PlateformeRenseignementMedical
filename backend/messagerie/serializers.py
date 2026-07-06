from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = Message
        fields = [
            "id",
            "expediteur",
            "contenu",
            "is_read",
            "created_at"
        ]


class ConversationSerializer(serializers.ModelSerializer):

    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "structure",
            "messages",
            "created_at"
        ]