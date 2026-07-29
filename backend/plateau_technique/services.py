from django.db import transaction

from .models import PlateauTechnique
from structures.models import Structure, StructureService


class PlateauTechniqueService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, service_id, disponible=True):

        structure = Structure.objects.get(id=structure_id)
        service = StructureService.objects.get(id=service_id)

        obj, created = PlateauTechnique.objects.update_or_create(
            structure=structure,
            service=service,
            defaults={"disponible": disponible}
        )

        return obj
