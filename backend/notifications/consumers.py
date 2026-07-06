import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from utilisateurs.models import Utilisateur


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        user = await self._authenticate()
        if user is None:
            await self.close()
            return

        self.user = user
        self.group_name = f"user_{user.id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            "id": event["id"],
            "titre": event["titre"],
            "message": event["message"],
            "type": event["type_notif"],
        }))

    async def _authenticate(self):
        query_string = self.scope.get("query_string", b"").decode()
        token = None
        for part in query_string.split("&"):
            if part.startswith("token="):
                token = part.split("=", 1)[1]
        if not token:
            return None
        try:
            access = AccessToken(token)
            user_id = access["user_id"]
            return await database_sync_to_async(
                Utilisateur.objects.filter(id=user_id).first
            )()
        except TokenError:
            return None
