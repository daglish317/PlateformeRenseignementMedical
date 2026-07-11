from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer, FeedbackUpdateSerializer
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


class UpdateFeedbackView(APIView):

    @patient_required
    def patch(self, request, pk):

        try:
            feedback = Feedback.objects.get(
                id=pk,
                utilisateur=request.user,
            )
        except Feedback.DoesNotExist:
            return Response(
                {"detail": "Feedback introuvable ou accès refusé"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = FeedbackUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        feedback = FeedbackService.modifier_feedback(
            feedback=feedback,
            note=serializer.validated_data.get("note"),
            commentaire=serializer.validated_data.get("commentaire"),
        )

        return Response(
            {"message": "Feedback mis à jour", "data": FeedbackSerializer(feedback).data},
            status=status.HTTP_200_OK,
        )


class AdminListFeedbackView(APIView):

    @admin_required
    def get(self, request):

        feedbacks = Feedback.objects.all().select_related(
            "utilisateur", "structure"
        ).order_by("-created_at")

        feedback_type = request.query_params.get("type")
        if feedback_type:
            feedbacks = feedbacks.filter(type=feedback_type)

        return Response(FeedbackSerializer(feedbacks, many=True).data)


class AdminStructureFeedbackView(APIView):

    @admin_required
    def get(self, request, structure_id):

        feedbacks = Feedback.objects.filter(
            structure_id=structure_id,
        ).select_related("utilisateur").order_by("-created_at")

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
