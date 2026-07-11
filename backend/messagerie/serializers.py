from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):

    expediteur_nom = serializers.CharField(source="expediteur.nom", read_only=True)
    expediteur_role = serializers.CharField(source="expediteur.role", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "expediteur",
            "expediteur_nom",
            "expediteur_role",
            "contenu",
            "is_read",
            "est_supprime",
            "created_at",
        ]


class ConversationSerializer(serializers.ModelSerializer):

    structure_nom = serializers.CharField(source="structure.nom", read_only=True, default=None)
    structure_id = serializers.UUIDField(source="structure.id", read_only=True, default=None)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "structure",
            "structure_id",
            "structure_nom",
            "created_at",
            "updated_at",
        ]


class ConversationDetailSerializer(serializers.ModelSerializer):

    messages = MessageSerializer(many=True, read_only=True)
    structure_nom = serializers.CharField(source="structure.nom", read_only=True, default=None)

    class Meta:
        model = Conversation
        fields = [
            "id",
            "structure",
            "structure_nom",
            "messages",
            "created_at",
            "updated_at",
        ]


class ConversationListItemSerializer(serializers.ModelSerializer):

    structure_nom = serializers.CharField(source="structure.nom", read_only=True, default=None)
    messages_non_lus = serializers.IntegerField(read_only=True, default=0)
    dernier_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "structure",
            "structure_nom",
            "messages_non_lus",
            "dernier_message",
            "updated_at",
        ]

    def get_dernier_message(self, obj):
        msg = getattr(obj, "dernier_message", None)
        if msg:
            return {
                "contenu": msg.contenu,
                "expediteur_nom": msg.expediteur.nom,
                "created_at": msg.created_at,
            }
        return None


class CompteurNonLusSerializer(serializers.Serializer):

    total_non_lus = serializers.IntegerField()