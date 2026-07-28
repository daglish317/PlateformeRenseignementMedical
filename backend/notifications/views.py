from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer
from .service import NotificationService
from utilisateurs.models import Utilisateur
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


class UnreadCountsByNavItemView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        counts = (
            Notification.objects.filter(
                utilisateur=request.user,
                est_lue=False,
            )
            .values("nav_item")
            .annotate(count=Count("id"))
        )
        result = {}
        for entry in counts:
            nav_item = entry["nav_item"] or ""
            result[nav_item] = entry["count"]
        total = sum(result.values())
        result["total"] = total
        return Response(result)


class AdminBroadcastNotificationView(APIView):
    @admin_required
    def post(self, request):
        titre = request.data.get("titre")
        message = request.data.get("message")
        notif_type = request.data.get("type", "ADMIN")
        nav_item = request.data.get("nav_item", "notifications")

        if not all([titre, message]):
            return Response({"detail": "Champs requis manquants"}, status=400)

        gestionnaires = Utilisateur.objects.filter(role="GESTIONNAIRE", is_active=True)

        created = []
        for g in gestionnaires:
            notif = NotificationService.envoyer(
                utilisateur=g,
                titre=titre,
                message=message,
                type=notif_type,
                nav_item=nav_item,
            )
            created.append(notif)

        return Response(
            {"message": f"Notification envoyée à {len(created)} gestionnaire(s)"},
            status=201,
        )


class AdminTriggerWeeklyReminderView(APIView):
    @admin_required
    def post(self, request):
        from django.core.management import call_command
        call_command("weekly_reminder")
        return Response({"message": "Rappels hebdomadaires envoyés"}, status=200)


class MarkAllAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            utilisateur=request.user,
            est_lue=False,
        ).update(est_lue=True)
        return Response({"message": f"{updated} notification(s) marquée(s) comme lue(s)"})
