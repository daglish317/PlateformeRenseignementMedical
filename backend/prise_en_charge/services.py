from django.db import transaction

from .models import Maladie, PriseEnCharge
from structures.models import Structure


class PriseEnChargeService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, maladie_nom, niveau=None):

        structure = Structure.objects.get(id=structure_id)

        maladie = Maladie.objects.filter(
            nom__iexact=maladie_nom
        ).first()

        if not maladie:
            maladie = Maladie.objects.create(nom=maladie_nom)

        prise, created = PriseEnCharge.objects.update_or_create(
            structure=structure,
            maladie=maladie,
            defaults={"niveau": niveau}
        )

        return prise