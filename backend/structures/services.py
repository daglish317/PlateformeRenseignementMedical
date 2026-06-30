from django.db import transaction
from django.utils import timezone

from .models import Structure, StatutStructure


class StructureService:
    """
    Toute la logique métier des structures.
    """

    @staticmethod
    @transaction.atomic
    def creer_structure(*, gestionnaire, donnees):

        if hasattr(gestionnaire, "structure"):
            raise ValueError(
                "Ce gestionnaire possède déjà une structure."
            )

        structure = Structure.objects.create(
            gestionnaire=gestionnaire,
            statut=StatutStructure.EN_ATTENTE,
            **donnees,
        )

        # TODO
        # Créer une notification administrateur
        # Envoyer un email au gestionnaire
        # Déclencher un journal d'activité

        return structure

    @staticmethod
    @transaction.atomic
    def valider_structure(structure):

        structure.statut = StatutStructure.ACTIVE
        structure.date_validation = timezone.now()

        structure.save(
            update_fields=[
                "statut",
                "date_validation",
            ]
        )

        # TODO
        # Notification au gestionnaire
        # Email de validation

        return structure

    @staticmethod
    @transaction.atomic
    def refuser_structure(structure):

        structure.statut = StatutStructure.REFUSEE

        structure.save(
            update_fields=[
                "statut",
            ]
        )

        # TODO
        # Notification au gestionnaire
        # Email de refus

        return structure