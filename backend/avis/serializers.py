from rest_framework import serializers

from .models import AvisStructure, CommentaireAvis


class CommentaireSerializer(serializers.ModelSerializer):

    class Meta:
        model = CommentaireAvis
        fields = ["id", "contenu", "created_at", "updated_at"]


class AvisSerializer(serializers.ModelSerializer):

    commentaires = CommentaireSerializer(many=True, read_only=True)

    class Meta:
        model = AvisStructure
        fields = [
            "id",
            "utilisateur",
            "structure",
            "note",
            "commentaires",
            "created_at"
        ]
        read_only_fields = ["note"]  # 🔥 IMPORTANT: note non modifiable


class AvisCreateSerializer(serializers.Serializer):

    structure_id = serializers.UUIDField()
    note = serializers.IntegerField(min_value=1, max_value=5)


class CommentaireCreateSerializer(serializers.Serializer):

    avis_id = serializers.UUIDField()
    contenu = serializers.CharField()