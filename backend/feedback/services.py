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
    def statistiques():
        structure_stats = (
            Feedback.objects.filter(type=TypeFeedback.STRUCTURE)
            .values("structure__nom", "structure_id")
            .annotate(moyenne=Avg("note"), total=Count("id"))
        )
        plateforme = Feedback.objects.filter(type=TypeFeedback.PLATEFORME).aggregate(
            moyenne=Avg("note"), total=Count("id")
        )
        return {
            "plateforme": plateforme,
            "structures": list(structure_stats),
        }
