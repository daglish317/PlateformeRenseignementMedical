from stock.models import StockItem
from service_medical.models import ServiceMedical
from plateau_technique.models import PlateauTechnique


class Scorer:

    @staticmethod
    def score(structure, service, user_lat=None, user_lon=None):

        score = 0

        score += 50

        if ServiceMedical.objects.filter(
            structure=structure, service=service, actif=True
        ).exists():
            score += 15

        if PlateauTechnique.objects.filter(
            structure=structure, service=service, disponible=True
        ).exists():
            score += 10

        stock_count = StockItem.objects.filter(
            structure=structure,
            disponible=True,
        ).count()
        score += min(stock_count * 5, 25)

        distance_km = None
        if user_lat and user_lon and structure.latitude and structure.longitude:
            from core.utils.distance import DistanceService

            distance_km = DistanceService.calculer_distance_km(
                user_lat,
                user_lon,
                float(structure.latitude),
                float(structure.longitude),
            )

            if distance_km is not None:
                if distance_km <= 2:
                    score += 30
                elif distance_km <= 5:
                    score += 20
                elif distance_km <= 10:
                    score += 10
                else:
                    score -= 10

        if structure.statut == "ACTIVE":
            score += 10

        return score, distance_km
