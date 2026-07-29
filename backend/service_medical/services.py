from django.db import transaction

from .models import ServiceMedical
from structures.models import Structure, StructureService


class ServiceMedicalService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, service_id, actif=True):

        structure = Structure.objects.get(id=structure_id)
        service = StructureService.objects.get(id=service_id)

        obj, created = ServiceMedical.objects.update_or_create(
            structure=structure,
            service=service,
            defaults={"actif": actif}
        )

        return obj
