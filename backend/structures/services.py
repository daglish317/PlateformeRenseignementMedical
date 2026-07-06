from django.db import transaction
from django.utils import timezone

from .models import Structure, StatutStructure

from core.utils.distance import DistanceService
from core.verification.session import VerificationSession

from core.events.dispatcher import EventDispatcher
from core.events.registry import EventTypes


class StructureService:
    """
    Toute la logique métier liée aux structures.
    """

    @staticmethod
    @transaction.atomic
    def creer_structure(*, gestionnaire, donnees):

        # Vérifie si structure déjà existante
        if hasattr(gestionnaire, "structure"):
            raise ValueError(
                "Ce gestionnaire possède déjà une structure."
            )

        # Vérifie OTP validé
        session = VerificationSession.objects.filter(
            email=gestionnaire.email,
            is_verified=True
        ).first()

        if session is None:
            raise ValueError(
                "Votre adresse email n'a pas été vérifiée."
            )

        # Création structure
        structure = Structure.objects.create(
            gestionnaire=gestionnaire,
            statut=StatutStructure.EN_ATTENTE,
            **donnees,
        )

        # Nettoyage session OTP
        session.delete()

        # Event
        EventDispatcher.dispatch(
            EventTypes.STRUCTURE_CREATED,
            {"structure": structure}
        )

        return structure

    # ======================================================
    # VALIDATION
    # ======================================================

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
            }
        )

        return structure

    # ======================================================
    # REFUS
    # ======================================================

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
            }
        )

        return structure


# ======================================================
# GEO SERVICE (inchangé mais propre)
# ======================================================

class StructureGeoService:

    @staticmethod
    def structures_proches(lat, lon, rayon_km=10):

        resultats = []

        structures = Structure.objects.filter(statut="ACTIVE", est_supprimee=False)

        for s in structures:
            if s.latitude and s.longitude:

                distance = DistanceService.calculer_distance_km(
                    lat,
                    lon,
                    s.latitude,
                    s.longitude
                )

                if distance is not None and distance <= rayon_km:
                    resultats.append({
                        "structure": s,
                        "distance": round(distance, 2)
                    })

        resultats.sort(key=lambda x: x["distance"])

        return resultats