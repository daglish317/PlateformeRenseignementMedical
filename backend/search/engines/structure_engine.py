from structures.models import Structure, StatutStructure
from prise_en_charge.models import PriseEnCharge
from service_medical.models import ServiceMedical
from plateau_technique.models import PlateauTechnique


class StructureEngine:

    @staticmethod
    def get_structures(catalogue):
        structure_ids = set()

        for model in (PriseEnCharge, ServiceMedical, PlateauTechnique):
            ids = model.objects.filter(
                catalogue=catalogue,
            ).values_list("structure_id", flat=True)
            structure_ids.update(ids)

        return Structure.objects.filter(
            id__in=structure_ids,
            statut=StatutStructure.ACTIVE,
            est_supprimee=False,
        ).distinct()

    @staticmethod
    def get_matched_services(structure, catalogue):
        services = []
        if ServiceMedical.objects.filter(
            structure=structure, catalogue=catalogue, actif=True
        ).exists():
            services.append(catalogue.nom)
        if PlateauTechnique.objects.filter(
            structure=structure, catalogue=catalogue, disponible=True
        ).exists():
            services.append(f"Plateau: {catalogue.nom}")
        if PriseEnCharge.objects.filter(
            structure=structure, catalogue=catalogue
        ).exists():
            services.append(f"Prise en charge: {catalogue.nom}")
        return services
