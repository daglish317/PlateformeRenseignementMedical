"""
Itinéraire praticable entre la position de l'utilisateur et une pharmacie
(spec moteurRecherche.md §24-26).

Le trajet privilégié est un itinéraire réellement praticable (service de
routage OSRM) plutôt qu'une simple ligne droite. En cas d'indisponibilité
du service, un repli déterministe (grand cercle) est utilisé afin de ne
jamais inventer de valeurs.
"""
import json
import urllib.request
from math import atan2, cos, radians, sin, sqrt

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


OSRM_URL = getattr(
    settings,
    "OSRM_PUBLIC_URL",
    "https://router.project-osrm.org/route/v1/driving",
)
OSRM_TIMEOUT = 5


def _haversine_km(lat1, lon1, lat2, lon2):
    if None in (lat1, lon1, lat2, lon2):
        return 0.0
    R = 6371
    lat1, lon1, lat2, lon2 = map(float, (lat1, lon1, lat2, lon2))
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    )
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def _appel_osrm(start_lng, start_lat, end_lng, end_lat):
    coords = f"{start_lng},{start_lat};{end_lng},{end_lat}"
    url = f"{OSRM_URL}/{coords}?overview=full&geometries=geojson"
    with urllib.request.urlopen(url, timeout=OSRM_TIMEOUT) as response:
        return json.loads(response.read().decode("utf-8"))


class RoutingView(APIView):
    """
    GET /api/routing/?start_lat=&start_lng=&end_lat=&end_lng=

    Retourne :
      route.coordinates : liste de [lat, lng] (ordre attendu par Leaflet) ;
      route.distance    : distance en mètres ;
      route.duration    : durée estimée en secondes.
    """

    def get(self, request):
        try:
            start_lat = float(request.query_params["start_lat"])
            start_lng = float(request.query_params["start_lng"])
            end_lat = float(request.query_params["end_lat"])
            end_lng = float(request.query_params["end_lng"])
        except (KeyError, TypeError, ValueError):
            return Response(
                {
                    "detail": (
                        "start_lat, start_lng, end_lat et end_lng "
                        "sont requis."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            data = _appel_osrm(start_lng, start_lat, end_lng, end_lat)
            route = data["routes"][0]
            coordinates = [
                [point[1], point[0]]  # OSRM (lng, lat) → Leaflet (lat, lng)
                for point in route["geometry"]["coordinates"]
            ]
            return Response(
                {
                    "route": {
                        "coordinates": coordinates,
                        "distance": round(float(route["distance"]), 1),
                        "duration": round(float(route["duration"]), 1),
                    }
                }
            )
        except Exception:
            # Repli déterministe : grand cercle, durée à ~50 km/h.
            distance_km = _haversine_km(start_lat, start_lng, end_lat, end_lng)
            distance_m = distance_km * 1000
            duration = distance_m / 13.9  # ~50 km/h en m/s
            return Response(
                {
                    "route": {
                        "coordinates": [
                            [start_lat, start_lng],
                            [end_lat, end_lng],
                        ],
                        "distance": round(distance_m, 1),
                        "duration": round(duration, 1),
                    }
                }
            )
