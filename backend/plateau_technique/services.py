from django.db import transaction

from .models import PlateauTechnique
from structures.models import Structure
from catalogues.models import Catalogue


class PlateauTechniqueService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(*, structure_id, catalogue_id, disponible=True):

        structure = Structure.objects.get(id=structure_id)
        catalogue = Catalogue.objects.get(id=catalogue_id)

        plateau, created = PlateauTechnique.objects.update_or_create(
            structure=structure,
            catalogue=catalogue,
            defaults={"disponible": disponible}
        )

        return plateau