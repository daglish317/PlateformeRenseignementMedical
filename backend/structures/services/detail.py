from structures.models import Structure
from prise_en_charge.models import PriseEnCharge
from plateau_technique.models import PlateauTechnique


class StructureDetailService:

    @staticmethod
    def get_structure_detail(structure_id):

        structure = Structure.objects.get(id=structure_id)

        maladies = PriseEnCharge.objects.filter(
            structure=structure
        ).select_related("maladie")

        plateau = PlateauTechnique.objects.filter(
            structure=structure
        ).select_related("equipement")

        return {
            "structure": structure,
            "maladies": maladies,
            "plateau": plateau
        }