import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from messagerie.services import MessagerieService
from messagerie.models import Conversation
from utilisateurs.models import Utilisateur


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):

        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"

        user = await self._authenticate()
        if user is None:
            await self.close()
            return

        self.user = user
        conversation = await self._get_conversation()
        if conversation is None:
            await self.close()
            return

        allowed = await database_sync_to_async(MessagerieService.peut_acceder)(
            user=user, conversation=conversation
        )
        if not allowed:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):

        data = json.loads(text_data)
        contenu = data.get("contenu")
        if not contenu:
            return

        conversation = await self._get_conversation()
        if conversation is None:
            return

        message = await database_sync_to_async(MessagerieService.envoyer_message)(
            conversation=conversation,
            expediteur=self.user,
            contenu=contenu,
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message.contenu,
                "expediteur_id": str(message.expediteur_id),
                "message_id": str(message.id),
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "expediteur_id": event["expediteur_id"],
            "message_id": event["message_id"],
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

    @database_sync_to_async
    def _get_conversation(self):
        try:
            return Conversation.objects.select_related("structure").get(
                id=self.conversation_id
            )
        except Conversation.DoesNotExist:
            return None
