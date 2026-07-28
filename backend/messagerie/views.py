from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    ConversationDetailSerializer,
    ConversationListItemSerializer,
    MessageSerializer,
    CompteurNonLusSerializer,
)
from .services import MessagerieService
from structures.models import Structure


class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, structure_id):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            structure = Structure.objects.get(id=structure_id)
        except Structure.DoesNotExist:
            return Response(
                {"detail": "Structure introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        conversation = MessagerieService.get_or_create_conversation(structure=structure)

        if not MessagerieService.peut_acceder(user=request.user, conversation=conversation):
            return Response({"detail": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        MessagerieService.marquer_conversation_lue(
            conversation=conversation,
            utilisateur=request.user,
        )

        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 50)), 100)
        messages, total = MessagerieService.lister_messages(
            conversation, page=page, page_size=page_size
        )

        data = ConversationDetailSerializer(conversation).data
        data["messages"] = MessageSerializer(messages, many=True).data
        data["total_messages"] = total
        data["page"] = page
        data["page_size"] = page_size
        return Response(data)


class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            conversation = Conversation.objects.select_related(
                "structure__gestionnaire"
            ).get(id=conversation_id)
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not MessagerieService.peut_acceder(user=request.user, conversation=conversation):
            return Response({"detail": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        contenu = request.data.get("contenu")
        if not contenu or not contenu.strip():
            return Response(
                {"detail": "Le contenu du message est requis"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = MessagerieService.envoyer_message(
            conversation=conversation,
            expediteur=request.user,
            contenu=contenu.strip(),
        )

        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MarkMessageReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            message = Message.objects.select_related(
                "conversation__structure"
            ).get(id=pk)
        except Message.DoesNotExist:
            return Response(
                {"detail": "Message introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not MessagerieService.peut_acceder(
            user=request.user, conversation=message.conversation
        ):
            return Response({"detail": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        MessagerieService.marquer_lu(message=message)
        return Response({"message": "lu"})


class DeleteMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            message = Message.objects.select_related(
                "conversation__structure"
            ).get(id=pk)
        except Message.DoesNotExist:
            return Response(
                {"detail": "Message introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not MessagerieService.peut_acceder(
            user=request.user, conversation=message.conversation
        ):
            return Response({"detail": "Accès refusé"}, status=status.HTTP_403_FORBIDDEN)

        try:
            MessagerieService.supprimer_message(
                message=message,
                utilisateur=request.user,
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_403_FORBIDDEN)

        return Response({"message": "Message supprimé"}, status=status.HTTP_200_OK)


class ListConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        conversations = MessagerieService.conversations_utilisateur(
            utilisateur=request.user,
        )

        conversations_avec_dernier = []
        for conv in conversations:
            dernier = Message.objects.filter(
                conversation=conv,
            ).exclude(
                est_supprime=True
            ).select_related("expediteur").first()

            non_lus = Message.objects.filter(
                conversation=conv,
                is_read=False,
            ).exclude(
                expediteur=request.user
            ).count()

            conv_data = ConversationListItemSerializer(conv, context={"request": request}).data
            conv_data["messages_non_lus"] = non_lus
            if dernier:
                conv_data["dernier_message"] = {
                    "contenu": dernier.contenu,
                    "expediteur_nom": dernier.expediteur.nom,
                    "created_at": dernier.created_at,
                }
            conversations_avec_dernier.append(conv_data)

        return Response(conversations_avec_dernier)


class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return Response(
                {"detail": "Accès réservé aux gestionnaires et administrateurs"},
                status=status.HTTP_403_FORBIDDEN,
            )

        total = MessagerieService.total_non_lus(utilisateur=request.user)

        return Response({"total_non_lus": total})
