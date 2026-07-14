from django.core.cache import cache

from ..engines.fuzzy_engine import FuzzyEngine
from ..engines.structure_engine import StructureEngine
from ..ranking.scorer import Scorer
from ..engines.fallback_engine import FallbackEngine
from ..utils.normalizer import normalize_query
from ..models import SearchLog


class SearchService:

    CACHE_TTL = 300

    @staticmethod
    def search(query: str, user_lat=None, user_lon=None, page=1, page_size=20):

        normalized = normalize_query(query)
        cache_key = f"search:{normalized}:{user_lat}:{user_lon}:{page}:{page_size}"
        cached = cache.get(cache_key)
        if cached:
            return cached

        catalogue = FuzzyEngine.best_match(normalized)

        if not catalogue:
            suggestions = FallbackEngine.suggest(normalized)
            result = {
                "query": query,
                "catalogue": None,
                "results": [],
                "suggestions": [{"id": str(s.id), "nom": s.nom, "type": s.type} for s in suggestions],
                "message": "Aucun résultat exact trouvé",
                "total": 0,
                "page": page,
                "page_size": page_size,
            }
            SearchService._log(query, user_lat, user_lon, 0)
            return result

        structures = StructureEngine.get_structures(catalogue)
        results = []

        for structure in structures:
            score, distance_km = Scorer.score(
                structure,
                catalogue,
                user_lat=user_lat,
                user_lon=user_lon,
            )
            results.append({
                "structure": {
                    "id": str(structure.id),
                    "nom": structure.nom,
                    "type": structure.type,
                    "photo": structure.photo.url if structure.photo else None,
                    "adresse": structure.adresse,
                    "latitude": float(structure.latitude) ,
                    "longitude": float(structure.longitude) ,
                  },
                "score": score,
                "distance_km": round(distance_km, 2) if distance_km is not None else None,
                "services_matches": StructureEngine.get_matched_services(structure, catalogue),
            })

        results.sort(key=lambda x: x["score"], reverse=True)
        total = len(results)
        start = (page - 1) * page_size
        end = start + page_size
        paginated = results[start:end]

        result = {
            "query": query,
            "catalogue": {
                "id": str(catalogue.id),
                "nom": catalogue.nom,
                "type": catalogue.type,
            },
            "results": paginated,
            "suggestions": [],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

        SearchService._log(query, user_lat, user_lon, total)
        cache.set(cache_key, result, SearchService.CACHE_TTL)
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
