from django.db import transaction

from .models import ServiceMedical
from structures.models import Structure
from catalogues.models import Catalogue


class ServiceMedicalService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, catalogue_id, actif=True):

        structure = Structure.objects.get(id=structure_id)
        catalogue = Catalogue.objects.get(id=catalogue_id)

        service, created = ServiceMedical.objects.update_or_create(
            structure=structure,
            catalogue=catalogue,
            defaults={"actif": actif}
        )

        return service