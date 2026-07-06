from math import radians, sin, cos, sqrt, atan2


class DistanceService:

    @staticmethod
    def calculer_distance_km(lat1, lon1, lat2, lon2):

        if None in [lat1, lon1, lat2, lon2]:
            return None

        R = 6371  # Rayon Terre (km)

        lat1 = float(lat1)
        lon1 = float(lon1)
        lat2 = float(lat2)
        lon2 = float(lon2)

        dlat = radians(lat2 - lat1)
        dlon = radians(lon2 - lon1)

        a = (
            sin(dlat / 2) ** 2
            + cos(radians(lat1))
            * cos(radians(lat2))
            * sin(dlon / 2) ** 2
        )

        c = 2 * atan2(sqrt(a), sqrt(1 - a))

        return R * c