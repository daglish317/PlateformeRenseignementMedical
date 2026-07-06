from django.db import transaction

from .models import Conversation, Message
from notifications.service import NotificationService
from notifications.models import TypeNotification
from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes


class MessagerieService:

    @staticmethod
    @transaction.atomic
    def get_or_create_conversation(*, structure):
        conversation, _ = Conversation.objects.get_or_create(structure=structure)
        return conversation

    @staticmethod
    @transaction.atomic
    def envoyer_message(*, conversation, expediteur, contenu):

        message = Message.objects.create(
            conversation=conversation,
            expediteur=expediteur,
            contenu=contenu,
        )

        structure = conversation.structure
        destinataire = None

        if expediteur.role == "ADMINISTRATEUR" and structure:
            destinataire = structure.gestionnaire
        elif expediteur.role == "GESTIONNAIRE":
            from utilisateurs.models import Utilisateur, RoleUtilisateur
            destinataire = Utilisateur.objects.filter(
                role=RoleUtilisateur.ADMINISTRATEUR
            ).first()

        if destinataire and destinataire != expediteur:
            NotificationService.envoyer(
                utilisateur=destinataire,
                titre="Nouveau message",
                message=contenu[:200],
                type=TypeNotification.SYSTEM,
                structure=structure,
            )

        EventDispatcher.dispatch(
            EventTypes.MESSAGE_SENT,
            {"message": message, "conversation": conversation},
        )

        return message

    @staticmethod
    @transaction.atomic
    def marquer_lu(*, message):
        message.is_read = True
        message.save(update_fields=["is_read"])

    @staticmethod
    def peut_acceder(*, user, conversation):
        structure = conversation.structure
        if not structure:
            return user.role == "ADMINISTRATEUR"
        if user.role == "ADMINISTRATEUR":
            return True
        if user.role == "GESTIONNAIRE":
            return structure.gestionnaire_id == user.id
        return False

    @staticmethod
    def lister_messages(conversation, page=1, page_size=50):
        start = (page - 1) * page_size
        end = start + page_size
        qs = conversation.messages.select_related("expediteur").order_by("-created_at")
        total = qs.count()
        return qs[start:end], total
