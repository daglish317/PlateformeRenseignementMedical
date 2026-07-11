from rest_framework import serializers

from .models import Feedback, TypeFeedback
from structures.models import Structure


class FeedbackSerializer(serializers.ModelSerializer):

    class Meta:
        model = Feedback
        fields = "__all__"


class FeedbackCreateSerializer(serializers.Serializer):

    type = serializers.ChoiceField(
        choices=TypeFeedback.choices,
        default=TypeFeedback.STRUCTURE,
    )
    structure_id = serializers.UUIDField(required=False, allow_null=True)
    note = serializers.IntegerField(min_value=1, max_value=5)
    commentaire = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        feedback_type = data.get("type", TypeFeedback.STRUCTURE)
        structure_id = data.get("structure_id")

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

        return data


class FeedbackUpdateSerializer(serializers.Serializer):

    note = serializers.IntegerField(min_value=1, max_value=5, required=False)
    commentaire = serializers.CharField(required=False, allow_blank=True)
