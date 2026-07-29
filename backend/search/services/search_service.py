from django.core.cache import cache

from ..engines.fuzzy_engine import FuzzyEngine
from ..engines.structure_engine import StructureEngine
from ..ranking.scorer import Scorer
from ..engines.fallback_engine import FallbackEngine
from ..utils.normalizer import normalize_query
from ..models import SearchLog
from ..services.routing_service import RoutingService


class SearchService:

    CACHE_TTL = 300

    @staticmethod
    def search(query: str, user_lat=None, user_lon=None, page=1, page_size=20):

        normalized = normalize_query(query)

        cache_key = (
            f"search:{normalized}:{user_lat}:{user_lon}:{page}:{page_size}"
        )

        cached = cache.get(cache_key)

        if cached:
            return cached


        service = FuzzyEngine.best_match(normalized)


        if not service:

            suggestions = FallbackEngine.suggest(normalized)

            result = {
                "query": query,
                "service": None,
                "results": [],
                "suggestions": [
                    {
                        "id": str(s.id),
                        "nom": s.nom,
                        "type": s.type
                    }
                    for s in suggestions
                ],
                "message": "Aucun résultat exact trouvé",
                "total": 0,
                "page": page,
                "page_size": page_size,
            }

            SearchService._log(
                query,
                user_lat,
                user_lon,
                0
            )

            return result



        structures = StructureEngine.get_structures(service)

        results = []


        for structure in structures:


            score, distance_km = Scorer.score(
                structure,
                service,
                user_lat=user_lat,
                user_lon=user_lon,
            )


            routing_distance = RoutingService.calculate_distance(
                user_lat,
                user_lon,
                structure.latitude,
                structure.longitude,
            )


            times = RoutingService.estimate_times(
                routing_distance
            )


            results.append({

                "structure": {

                    "id": str(structure.id),

                    "nom": structure.nom,

                    "type": structure.type,

                    "photo": (
                        structure.photo.url
                        if structure.photo
                        else None
                    ),

                    "adresse": structure.adresse,

                    "telephone": structure.telephone,

                    "latitude": (
                        float(structure.latitude)
                        if structure.latitude
                        else None
                    ),

                    "longitude": (
                        float(structure.longitude)
                        if structure.longitude
                        else None
                    ),
                },


                "score": score,


                "distance_km": routing_distance,


                "walking_time": times["walking_time"],


                "driving_time": times["driving_time"],


                "service_matches": (
                    StructureEngine.get_matched_services(
                        structure,
                        service
                    )
                ),
            })



        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )



        total = len(results)


        start = (page - 1) * page_size

        end = start + page_size


        paginated = results[start:end]



        result = {

            "query": query,


            "service": {

                "id": str(service.id),

                "nom": service.nom,

                "type": service.type,

            },


            "results": paginated,


            "suggestions": [],


            "total": total,


            "page": page,


            "page_size": page_size,

        }



        SearchService._log(
            query,
            user_lat,
            user_lon,
            total
        )


        cache.set(
            cache_key,
            result,
            SearchService.CACHE_TTL
        )


        return result



    @staticmethod
    def _log(query, user_lat, user_lon, count):

        try:

            SearchLog.objects.create(
                query=query[:255],
                user_lat=user_lat,
                user_lon=user_lon,
                results_count=count,
            )

        except Exception:

            pass
