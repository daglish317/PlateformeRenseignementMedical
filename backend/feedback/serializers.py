from rest_framework import serializers
from django.utils import timezone

from .models import Feedback, TypeFeedback
from structures.models import Structure


class FeedbackSerializer(serializers.ModelSerializer):
    utilisateur_nom = serializers.CharField(source="utilisateur.nom", read_only=True)
    utilisateur_email = serializers.CharField(source="utilisateur.email", read_only=True)
    message = serializers.CharField(source="commentaire", read_only=True)
    date_creation = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = Feedback
        fields = [
            "id",
            "utilisateur_nom",
            "utilisateur_email",
            "categorie",
            "sujet",
            "message",
            "statut",
            "date_creation",
            "structure",
            "note",
        ]


class FeedbackCreateSerializer(serializers.Serializer):

    type = serializers.ChoiceField(
        choices=TypeFeedback.choices,
        default=TypeFeedback.STRUCTURE,
    )
    structure_id = serializers.UUIDField(required=False, allow_null=True)
    note = serializers.IntegerField(min_value=1, max_value=5, required=False)
    commentaire = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        feedback_type = data.get("type", TypeFeedback.STRUCTURE)
        structure_id = data.get("structure_id")
        note = data.get("note")
        commentaire = data.get("commentaire", "").strip()

        if feedback_type == TypeFeedback.STRUCTURE:
            if not structure_id:
                raise serializers.ValidationError(
                    {"structure_id": "Requis pour un feedback structure."}
                )
            if not Structure.objects.filter(id=structure_id).exists():
                raise serializers.ValidationError(
                    {"structure_id": "Structure invalide."}
                )
        elif structure_id:
            raise serializers.ValidationError(
                {"structure_id": "Non autorisé pour un feedback plateforme."}
            )

        user = self.context["request"].user

        if note is not None and Feedback.objects.filter(
            utilisateur=user, note__isnull=False
        ).exclude(note=0).exists():
            raise serializers.ValidationError(
                {"note": "Vous avez déjà attribué une note. Vous ne pouvez noter qu'une seule fois."}
            )

        if commentaire:
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_count = Feedback.objects.filter(
                utilisateur=user,
                created_at__gte=today_start,
            ).exclude(commentaire__isnull=True).exclude(commentaire__exact="").count()
            if today_count >= 3:
                raise serializers.ValidationError(
                    {"commentaire": "Vous avez atteint la limite de 3 commentaires par jour."}
                )

        return data


class FeedbackUpdateSerializer(serializers.Serializer):

    note = serializers.IntegerField(min_value=1, max_value=5, required=False)
    commentaire = serializers.CharField(required=False, allow_blank=True)
