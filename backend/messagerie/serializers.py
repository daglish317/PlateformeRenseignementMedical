from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):

    expediteur = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "id",
            "expediteur",
            "contenu",
            "is_read",
            "est_supprime",
            "created_at",
        ]

    def get_expediteur(self, obj):
        return {
            "id": str(obj.expediteur.id),
            "nom": obj.expediteur.nom,
            "role": obj.expediteur.role,
        }


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

    structure = serializers.SerializerMethodField()
    structure_nom = serializers.CharField(source="structure.nom", read_only=True, default=None)
    structure_type = serializers.CharField(source="structure.type", read_only=True, default=None)
    structure_photo = serializers.SerializerMethodField()
    messages_non_lus = serializers.IntegerField(read_only=True, default=0)
    dernier_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "structure",
            "structure_nom",
            "structure_type",
            "structure_photo",
            "messages_non_lus",
            "dernier_message",
            "updated_at",
        ]

    def get_structure(self, obj):
        if not obj.structure:
            return None
        return {
            "id": str(obj.structure.id),
            "nom": obj.structure.nom,
            "type": obj.structure.type,
            "photo": None,
        }

    def get_structure_photo(self, obj):
        if obj.structure and obj.structure.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.structure.photo.url)
            return obj.structure.photo.url
        return None

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