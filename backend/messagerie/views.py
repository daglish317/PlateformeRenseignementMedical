from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from .services import MessagerieService
from structures.models import Structure


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, structure_id):

        structure = Structure.objects.get(id=structure_id)
        conversation = MessagerieService.get_or_create_conversation(structure=structure)

        if not MessagerieService.peut_acceder(user=request.user, conversation=conversation):
            return Response({"detail": "Accès refusé"}, status=403)

        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        messages, total = MessagerieService.lister_messages(
            conversation, page=page, page_size=page_size
        )

        data = ConversationSerializer(conversation).data
        data["messages"] = MessageSerializer(messages, many=True).data
        data["total_messages"] = total
        data["page"] = page
        data["page_size"] = page_size
        return Response(data)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):

        conversation = Conversation.objects.select_related(
            "structure__gestionnaire"
        ).get(id=conversation_id)

        if not MessagerieService.peut_acceder(user=request.user, conversation=conversation):
            return Response({"detail": "Accès refusé"}, status=403)

        message = MessagerieService.envoyer_message(
            conversation=conversation,
            expediteur=request.user,
            contenu=request.data.get("contenu"),
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        message = Message.objects.select_related(
            "conversation__structure"
        ).get(id=pk)

        if not MessagerieService.peut_acceder(
            user=request.user, conversation=message.conversation
        ):
            return Response({"detail": "Accès refusé"}, status=403)

        MessagerieService.marquer_lu(message=message)
        return Response({"message": "lu"})
