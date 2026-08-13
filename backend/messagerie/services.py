from django.db import transaction

from .models import Conversation, Message
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

        conversation.save(update_fields=["updated_at"])

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
    @transaction.atomic
    def marquer_conversation_lue(*, conversation, utilisateur):
        Message.objects.filter(
            conversation=conversation,
            is_read=False,
        ).exclude(
            expediteur=utilisateur
        ).update(is_read=True)

    @staticmethod
    @transaction.atomic
    def supprimer_message(*, message, utilisateur):
        if message.expediteur_id != utilisateur.id:
            raise ValueError("Vous ne pouvez supprimer que vos propres messages.")
        message.est_supprime = True
        message.contenu = "Message supprimé"
        message.save(update_fields=["est_supprime", "contenu"])

    @staticmethod
    def peut_acceder(*, user, conversation):
        if user.role not in ("ADMINISTRATEUR", "GESTIONNAIRE"):
            return False
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
        qs = conversation.messages.select_related("expediteur").order_by("created_at")
        total = qs.count()
        return qs[start:end], total

    @staticmethod
    def conversations_utilisateur(*, utilisateur):
        if utilisateur.role == "ADMINISTRATEUR":
            from structures.models import Structure
            active_structures = Structure.objects.filter(
                statut="ACTIVE",
                est_supprimee=False,
            )
            existing_ids = Conversation.objects.filter(
                structure__in=active_structures,
            ).values_list("structure_id", flat=True)
            manquantes = active_structures.exclude(id__in=existing_ids)
            if manquantes.exists():
                Conversation.objects.bulk_create(
                    [Conversation(structure=s) for s in manquantes]
                )

            conversations = Conversation.objects.filter(
                structure__isnull=False,
                structure__statut="ACTIVE",
                structure__est_supprimee=False,
            ).select_related("structure", "structure__gestionnaire")
        elif utilisateur.role == "GESTIONNAIRE":
            conversations = Conversation.objects.filter(
                structure__gestionnaire=utilisateur,
            ).select_related("structure", "structure__gestionnaire")
        else:
            return Conversation.objects.none()

        return conversations.order_by("-updated_at")

    @staticmethod
    def compteur_non_lus(*, utilisateur):
        conversations = MessagerieService.conversations_utilisateur(utilisateur=utilisateur)

        resultats = []
        for conv in conversations:
            non_lus = Message.objects.filter(
                conversation=conv,
                is_read=False,
            ).exclude(
                expediteur=utilisateur
            ).count()

            dernier_message = Message.objects.filter(
                conversation=conv,
            ).exclude(
                est_supprime=True
            ).select_related("expediteur").first()

            resultats.append({
                "conversation_id": conv.id,
                "structure": {
                    "id": conv.structure.id,
                    "nom": conv.structure.nom,
                } if conv.structure else None,
                "messages_non_lus": non_lus,
                "dernier_message": {
                    "contenu": dernier_message.contenu if dernier_message else None,
                    "expediteur": dernier_message.expediteur.nom if dernier_message else None,
                    "created_at": dernier_message.created_at if dernier_message else None,
                } if dernier_message else None,
                "updated_at": conv.updated_at,
            })

        return resultats

    @staticmethod
    def total_non_lus(*, utilisateur):
        conversations = MessagerieService.conversations_utilisateur(utilisateur=utilisateur)
        return Message.objects.filter(
            conversation__in=conversations,
            is_read=False,
        ).exclude(
            expediteur=utilisateur
        ).count()
