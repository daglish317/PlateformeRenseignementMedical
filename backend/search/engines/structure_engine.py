from structures.models import Structure, StatutStructure
from prise_en_charge.models import PriseEnCharge
from service_medical.models import ServiceMedical
from plateau_technique.models import PlateauTechnique


class StructureEngine:

    @staticmethod
    def get_structures(service):
        structure_ids = set()

        for model in (PriseEnCharge, ServiceMedical, PlateauTechnique):
            ids = model.objects.filter(
                service=service,
            ).values_list("structure_id", flat=True)
            structure_ids.update(ids)

        return Structure.objects.filter(
            id__in=structure_ids,
            statut=StatutStructure.ACTIVE,
            est_supprimee=False,
        ).distinct()

    @staticmethod
    def get_matched_services(structure, service):
        services = []
        if ServiceMedical.objects.filter(
            structure=structure, service=service, actif=True
        ).exists():
            services.append(service.nom)
        if PlateauTechnique.objects.filter(
            structure=structure, service=service, disponible=True
        ).exists():
            services.append(f"Plateau: {service.nom}")
        if PriseEnCharge.objects.filter(
            structure=structure, service=service
        ).exists():
            services.append(f"Prise en charge: {service.nom}")
        return services
