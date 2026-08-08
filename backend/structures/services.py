from django.db import transaction
from django.utils import timezone

from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes
from core.utils.distance import DistanceService
from core.verification.session import VerificationSession
from .models import StatutStructure, Structure
from .permissions import get_user_structure


class StructureService:
    """
    Logique metier liee aux structures.
    """

    @staticmethod
    @transaction.atomic
    def creer_structure(*, gestionnaire, donnees):
        session = VerificationSession.objects.filter(
            email=gestionnaire.email,
            is_verified=True,
        ).first()

        if session is None:
            raise ValueError("Votre adresse email n'a pas ete verifiee.")

        existing_structure = get_user_structure(gestionnaire)
        if existing_structure:
            for field, value in donnees.items():
                setattr(existing_structure, field, value)
            existing_structure.statut = StatutStructure.EN_ATTENTE
            existing_structure.motif_refus = ""
            existing_structure.save()
            session.delete()

            EventDispatcher.dispatch(
                EventTypes.STRUCTURE_CREATED,
                {"structure": existing_structure},
            )

            return existing_structure

        if hasattr(gestionnaire, "structure") and gestionnaire.structure:
            raise ValueError("Ce compte possede deja une structure.")

        structure = Structure.objects.create(
            gestionnaire=gestionnaire,
            statut=StatutStructure.EN_ATTENTE,
            **donnees,
        )

        session.delete()

        EventDispatcher.dispatch(
            EventTypes.STRUCTURE_CREATED,
            {"structure": structure},
        )

        return structure

    @staticmethod
    @transaction.atomic
    def valider_structure(*, structure, administrateur):
        if structure.statut != StatutStructure.EN_ATTENTE:
            raise ValueError("Cette structure n'est plus en attente.")

        structure.statut = StatutStructure.ACTIVE
        structure.date_validation = timezone.now()
        structure.valide_par = administrateur
        structure.motif_refus = ""

        structure.save(update_fields=[
            "statut",
            "date_validation",
            "valide_par",
            "motif_refus",
        ])

        EventDispatcher.dispatch(
            EventTypes.STRUCTURE_VALIDATED,
            {
                "structure": structure,
                "administrateur": administrateur,
            },
        )

        return structure

    @staticmethod
    @transaction.atomic
    def refuser_structure(*, structure, administrateur, motif):
        if structure.statut != StatutStructure.EN_ATTENTE:
            raise ValueError("Cette structure n'est plus en attente.")

        structure.statut = StatutStructure.REFUSEE
        structure.valide_par = administrateur
        structure.motif_refus = motif

        structure.save(update_fields=[
            "statut",
            "valide_par",
            "motif_refus",
        ])

        EventDispatcher.dispatch(
            EventTypes.STRUCTURE_REJECTED,
            {
                "structure": structure,
                "administrateur": administrateur,
                "motif": motif,
            },
        )

        return structure


class StructureGeoService:

    @staticmethod
    def structures_proches(lat, lon, rayon_km=10):
        resultats = []
        structures = Structure.objects.filter(statut="ACTIVE", est_supprimee=False)

        for structure in structures:
            if structure.latitude and structure.longitude:
                distance = DistanceService.calculer_distance_km(
                    lat,
                    lon,
                    structure.latitude,
                    structure.longitude,
                )

                if distance is not None and distance <= rayon_km:
                    resultats.append({
                        "structure": structure,
                        "distance": round(distance, 2),
                    })

        resultats.sort(key=lambda item: item["distance"])
        return resultats
