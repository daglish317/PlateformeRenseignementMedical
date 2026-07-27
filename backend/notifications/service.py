from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification


class NotificationService:

    @staticmethod
    @transaction.atomic
    def envoyer(
        utilisateur,
        titre,
        message,
        type="SYSTEM",
        structure=None,
        nav_item="",
    ):

        notif = Notification.objects.create(
            utilisateur=utilisateur,
            titre=titre,
            message=message,
            type=type,
            structure=structure,
            nav_item=nav_item,
        )

        NotificationService._push_websocket(notif)
        return notif

    @staticmethod
    def _push_websocket(notif):
        try:
            channel_layer = get_channel_layer()
            if channel_layer is None:
                return
            async_to_sync(channel_layer.group_send)(
                f"user_{notif.utilisateur_id}",
                {
                    "type": "notification_message",
                    "id": str(notif.id),
                    "titre": notif.titre,
                    "message": notif.message,
                    "type_notif": notif.type,
                    "nav_item": notif.nav_item,
                },
            )
        except Exception:
            pass

    @staticmethod
    def expirer_anciennes(jours=30):
        from django.utils import timezone
        from datetime import timedelta
        seuil = timezone.now() - timedelta(days=jours)
        return Notification.objects.filter(
            date_creation__lt=seuil,
            est_lue=True,
        ).delete()
