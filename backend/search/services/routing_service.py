import math


class RoutingService:

    @staticmethod
    def calculate_distance(
        user_lat,
        user_lon,
        structure_lat,
        structure_lon,
    ):

        if None in [
            user_lat,
            user_lon,
            structure_lat,
            structure_lon,
        ]:
            return None


        radius = 6371


        lat1 = math.radians(float(user_lat))
        lon1 = math.radians(float(user_lon))

        lat2 = math.radians(float(structure_lat))
        lon2 = math.radians(float(structure_lon))


        dlat = lat2 - lat1
        dlon = lon2 - lon1


        a = (
            math.sin(dlat / 2) ** 2
            +
            math.cos(lat1)
            *
            math.cos(lat2)
            *
            math.sin(dlon / 2) ** 2
        )


        c = 2 * math.atan2(
            math.sqrt(a),
            math.sqrt(1 - a)
        )


        return round(radius * c, 2)



    @staticmethod
    def estimate_times(distance_km):

        if distance_km is None:
            return {
                "walking_time": None,
                "driving_time": None,
            }


        # vitesse moyenne réaliste
        walking_speed = 5       # km/h
        driving_speed = 40      # km/h


        walking_minutes = round(
            (distance_km / walking_speed) * 60
        )


        driving_minutes = round(
            (distance_km / driving_speed) * 60
        )


        return {
            "walking_time": walking_minutes,
            "driving_time": driving_minutes,
        }