from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Feedback, TypeFeedback
from .serializers import FeedbackSerializer, FeedbackCreateSerializer, FeedbackUpdateSerializer
from .services import FeedbackService

from utilisateurs.decorators import admin_required


class CreateFeedbackView(APIView):

    def post(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifié"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = FeedbackCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        feedback = FeedbackService.ajouter_feedback(
            utilisateur=request.user,
            structure_id=data.get("structure_id"),
            note=data.get("note"),
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

    def patch(self, request, pk):
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifié"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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
        from django.db.models import Q

        feedbacks = Feedback.objects.filter(
            type=TypeFeedback.PLATEFORME,
        ).select_related("utilisateur").order_by("-created_at")

        search = request.query_params.get("search", "").strip()
        if search:
            feedbacks = feedbacks.filter(
                Q(utilisateur__nom__icontains=search)
                | Q(utilisateur__email__icontains=search)
                | Q(sujet__icontains=search)
            )

        statut = request.query_params.get("statut")
        if statut:
            feedbacks = feedbacks.filter(statut=statut)

        categorie = request.query_params.get("categorie")
        if categorie:
            feedbacks = feedbacks.filter(categorie=categorie)

        page = max(int(request.query_params.get("page", 1)), 1)
        page_size = min(int(request.query_params.get("page_size", 20)), 100)
        total = feedbacks.count()
        start = (page - 1) * page_size
        items = feedbacks[start : start + page_size]

        return Response({
            "results": FeedbackSerializer(items, many=True).data,
            "page": page,
            "page_size": page_size,
            "total": total,
        })


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


class UpdateFeedbackStatusView(APIView):

    @admin_required
    def patch(self, request, pk):
        try:
            feedback = Feedback.objects.get(id=pk, type=TypeFeedback.PLATEFORME)
        except Feedback.DoesNotExist:
            return Response({"detail": "Feedback introuvable"}, status=404)

        statut = request.data.get("statut")
        if statut not in ("NON_LU", "LU", "TRAITE"):
            return Response({"detail": "Statut invalide"}, status=400)

        feedback.statut = statut
        feedback.save(update_fields=["statut"])
        return Response({"message": "Statut mis à jour", "data": FeedbackSerializer(feedback).data})


class DeleteFeedbackView(APIView):

    @admin_required
    def delete(self, request, pk):
        try:
            feedback = Feedback.objects.get(id=pk)
        except Feedback.DoesNotExist:
            return Response({"detail": "Introuvable"}, status=404)
        feedback.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
