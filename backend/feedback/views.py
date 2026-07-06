from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer
from .services import FeedbackService

from utilisateurs.decorators import admin_required, patient_required


class CreateFeedbackView(APIView):

    @patient_required
    def post(self, request):

        serializer = FeedbackCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        feedback = FeedbackService.ajouter_feedback(
            utilisateur=request.user,
            structure_id=data.get("structure_id"),
            note=data["note"],
            commentaire=data.get("commentaire"),
            feedback_type=data["type"],
        )

        return Response(
            {
                "message": "Feedback enregistré",
                "data": FeedbackSerializer(feedback).data,
            },
            status=status.HTTP_201_CREATED,
        )


class StructureFeedbackListView(APIView):

    def get(self, request, structure_id):

        feedbacks = Feedback.objects.filter(
            structure_id=structure_id,
        ).order_by("-created_at")

        return Response(FeedbackSerializer(feedbacks, many=True).data)


class FeedbackStatsView(APIView):

    @admin_required
    def get(self, request):
        return Response(FeedbackService.statistiques())


class DeleteFeedbackView(APIView):

    @admin_required
    def delete(self, request, pk):
        try:
            feedback = Feedback.objects.get(id=pk)
        except Feedback.DoesNotExist:
            return Response({"detail": "Introuvable"}, status=404)
        feedback.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
