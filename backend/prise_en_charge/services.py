from django.db import transaction

from .models import PriseEnCharge
from structures.models import Structure
from catalogues.models import Catalogue


class PriseEnChargeService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, catalogue_id, niveau=None):

        structure = Structure.objects.get(id=structure_id)
        catalogue = Catalogue.objects.get(id=catalogue_id)

        prise, created = PriseEnCharge.objects.update_or_create(
            structure=structure,
            catalogue=catalogue,
            defaults={"niveau": niveau}
        )

        return prise

    @staticmethod
    @transaction.atomic
    def modifier(*, prise_en_charge, niveau):
        prise_en_charge.niveau = niveau
        prise_en_charge.save(update_fields=["niveau"])
        return prise_en_charge

    @staticmethod
    @transaction.atomic
    def supprimer(*, prise_en_charge):
        prise_en_charge.delete()