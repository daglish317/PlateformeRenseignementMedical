from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer
from .service import NotificationService
from utilisateurs.decorators import admin_required


class MyNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        NotificationService.expirer_anciennes()

        notifications = Notification.objects.filter(
            utilisateur=request.user,
        ).select_related("structure").order_by("-date_creation")

        notif_type = request.query_params.get("type")
        if notif_type:
            notifications = notifications.filter(type=notif_type)

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            notif = Notification.objects.get(id=pk, utilisateur=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification introuvable"}, status=404)

        notif.marquer_comme_lue()
        return Response({"message": "Notification marquée comme lue"})


class DeleteNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        try:
            notif = Notification.objects.get(id=pk, utilisateur=request.user)
        except Notification.DoesNotExist:
            return Response({"detail": "Notification introuvable"}, status=404)

        notif.delete()
        return Response(
            {"message": "Notification supprimée"},
            status=status.HTTP_200_OK,
        )


class AdminSendNotificationView(APIView):

    @admin_required
    def post(self, request):

        from utilisateurs.models import Utilisateur

        utilisateur_id = request.data.get("utilisateur_id")
        titre = request.data.get("titre")
        message = request.data.get("message")
        notif_type = request.data.get("type", "ADMIN")

        if not all([utilisateur_id, titre, message]):
            return Response({"detail": "Champs requis manquants"}, status=400)

        try:
            utilisateur = Utilisateur.objects.get(id=utilisateur_id)
        except Utilisateur.DoesNotExist:
            return Response({"detail": "Utilisateur introuvable"}, status=404)

        notif = NotificationService.envoyer(
            utilisateur=utilisateur,
            titre=titre,
            message=message,
            type=notif_type,
        )

        return Response(NotificationSerializer(notif).data, status=201)
