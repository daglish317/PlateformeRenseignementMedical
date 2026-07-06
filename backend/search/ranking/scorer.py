from stock.models import StockItem
from service_medical.models import ServiceMedical
from plateau_technique.models import PlateauTechnique


class Scorer:

    @staticmethod
    def score(structure, catalogue, user_lat=None, user_lon=None):

        score = 0

        # Pertinence catalogue
        score += 50

        # Mots-clés / services actifs
        if ServiceMedical.objects.filter(
            structure=structure, catalogue=catalogue, actif=True
        ).exists():
            score += 15

        if PlateauTechnique.objects.filter(
            structure=structure, catalogue=catalogue, disponible=True
        ).exists():
            score += 10

        # Stock disponible
        stock_count = StockItem.objects.filter(
            structure=structure,
            disponible=True,
        ).count()
        score += min(stock_count * 5, 25)

        # Distance géographique
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

        # Structure active
        if structure.statut == "ACTIVE":
            score += 10

        return score, distance_km
