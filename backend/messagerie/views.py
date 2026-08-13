from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q, OuterRef, Subquery

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

        dernier = Message.objects.filter(
            conversation=OuterRef("pk"),
            est_supprime=False,
        ).order_by("-created_at", "-pk")

        conversations = conversations.annotate(
            _dernier_contenu=Subquery(dernier.values("contenu")[:1]),
            _dernier_expediteur=Subquery(
                dernier.values("expediteur__nom")[:1]
            ),
            _dernier_created=Subquery(dernier.values("created_at")[:1]),
            _nb_non_lus=Count(
                "messages",
                filter=Q(messages__is_read=False)
                & ~Q(messages__expediteur=request.user),
            ),
        )

        conversations_avec_dernier = []
        for conv in conversations:
            conv_data = ConversationListItemSerializer(
                conv, context={"request": request}
            ).data
            conv_data["messages_non_lus"] = conv._nb_non_lus
            if conv._dernier_contenu is not None:
                conv_data["dernier_message"] = {
                    "contenu": conv._dernier_contenu,
                    "expediteur_nom": conv._dernier_expediteur,
                    "created_at": conv._dernier_created,
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
