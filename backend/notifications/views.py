from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            utilisateur=request.user
        ).order_by("-date_creation")

        return Response(
            NotificationSerializer(notifications, many=True).data
        )


class MarkAsReadView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            notif = Notification.objects.get(
                id=pk,
                utilisateur=request.user
            )
        except Notification.DoesNotExist:
            return Response({"detail": "Introuvable"}, status=404)

        notif.est_lue = True
        notif.save()

        return Response({"message": "Notification marquée comme lue"})
