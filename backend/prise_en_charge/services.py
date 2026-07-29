from django.db import transaction

from .models import PriseEnCharge
from structures.models import Structure, StructureService


class PriseEnChargeService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, service_id, niveau=None):

        structure = Structure.objects.get(id=structure_id)
        service = StructureService.objects.get(id=service_id)

        obj, created = PriseEnCharge.objects.update_or_create(
            structure=structure,
            service=service,
            defaults={"niveau": niveau}
        )

        return obj

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
