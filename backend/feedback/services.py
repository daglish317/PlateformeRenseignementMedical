from django.db import transaction
from django.db.models import Avg, Count

from .models import Feedback, TypeFeedback
from structures.models import Structure

from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes


class FeedbackService:

    @staticmethod
    @transaction.atomic
    def ajouter_feedback(
        *,
        utilisateur,
        note,
        commentaire=None,
        structure_id=None,
        feedback_type=None,
    ):

        if feedback_type == TypeFeedback.PLATEFORME:
            feedback = Feedback.objects.create(
                utilisateur=utilisateur,
                structure=None,
                type=TypeFeedback.PLATEFORME,
                note=note,
                commentaire=commentaire,
            )
            structure = None
        else:
            structure = Structure.objects.get(id=structure_id)
            feedback = Feedback.objects.create(
                utilisateur=utilisateur,
                structure=structure,
                type=TypeFeedback.STRUCTURE,
                note=note,
                commentaire=commentaire,
            )

        EventDispatcher.dispatch(
            EventTypes.FEEDBACK_CREATED,
            {
                "feedback": feedback,
                "structure": structure,
                "utilisateur": utilisateur,
            },
        )

        return feedback

    @staticmethod
    @transaction.atomic
    def modifier_feedback(*, feedback, note=None, commentaire=None):
        if note is not None:
            feedback.note = note
        if commentaire is not None:
            feedback.commentaire = commentaire
        feedback.save()
        return feedback

    @staticmethod
    def statistiques():
        base = Feedback.objects.filter(type=TypeFeedback.PLATEFORME)
        total = base.count()
        non_lus = base.filter(statut="NON_LU").count()
        lus = base.filter(statut="LU").count()
        traites = base.filter(statut="TRAITE").count()
        avg = base.aggregate(moyenne=Avg("note"))["moyenne"]
        return {
            "total": total,
            "non_lus": non_lus,
            "lus": lus,
            "traites": traites,
            "moyenne": round(avg, 1) if avg else 0,
        }
