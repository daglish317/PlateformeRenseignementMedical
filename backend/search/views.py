"""
API Views pour le moteur de recherche unifie - OPTIMISE POUR PERFORMANCE
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.cache import RedisCacheService

from .engines.unified_engine import UnifiedSearchEngine
from .services.history_service import SearchHistoryService


class UnifiedSearchAPIView(APIView):
    """
    Endpoint principal de recherche unifiee (Exigences #1-#17)
    GET /api/search/unified/?q=paracetamol&lat=3.8&lon=11.5

    OPTIMISATIONS:
    - Cache Redis 5 minutes
    - Query optimization
    - Compression response
    """

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response(
                {"error": 'Parametre "q" requis'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_lat = float(request.query_params.get("lat")) if request.query_params.get("lat") else None
            user_lon = float(request.query_params.get("lon")) if request.query_params.get("lon") else None
        except ValueError:
            user_lat = user_lon = None

        try:
            page = int(request.query_params.get("page", 1))
            page_size = min(int(request.query_params.get("page_size", 20)), 50)
        except ValueError:
            page = 1
            page_size = 20

        offset = (page - 1) * page_size

        cache_key = RedisCacheService.generate_cache_key(
            "search",
            query,
            user_lat,
            user_lon,
            page,
            page_size,
        )

        cached_result = RedisCacheService.get(cache_key)
        if cached_result:
            return Response(cached_result, status=status.HTTP_200_OK)

        result = UnifiedSearchEngine.search(
            query=query,
            user_lat=user_lat,
            user_lon=user_lon,
            limit=page_size,
            offset=offset,
        )

        try:
            SearchHistoryService.record_search(
                user=request.user if request.user.is_authenticated else None,
                query=query,
                results_count=result["total"],
                search_type=result.get("detected_intent") or "",
            )
        except Exception as e:
            print(f"Erreur log recherche: {e}")

        result["page"] = page
        result["page_size"] = page_size
        result["has_next"] = (offset + page_size) < result["total"]
        result["has_previous"] = page > 1

        RedisCacheService.set(cache_key, result, timeout=300)
        return Response(result, status=status.HTTP_200_OK)


class LiveSearchAPIView(APIView):
    """
    Live search pour autocompletion (Exigence #2, #6)
    GET /api/search/live/?q=par

    OPTIMISATIONS:
    - Cache Redis 3 minutes
    - Limite 8 resultats
    - Query ultra-rapide
    """

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if len(query) < 2:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)

        try:
            limit = min(int(request.query_params.get("limit", 8)), 15)
        except ValueError:
            limit = 8

        cache_key = RedisCacheService.generate_cache_key("live_search", query, limit)
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)

        suggestions = UnifiedSearchEngine.live_search(query, limit=limit)
        response_data = {"query": query, "suggestions": suggestions}

        RedisCacheService.set(cache_key, response_data, timeout=180)
        return Response(response_data, status=status.HTTP_200_OK)


class SearchSuggestionsAPIView(APIView):
    """
    Suggestions intelligentes (Exigence #6)
    GET /api/search/suggestions/?q=parace

    OPTIMISATIONS:
    - Cache Redis 10 minutes
    """

    def get(self, request):
        query = request.query_params.get("q", "").strip()

        if not query:
            return Response({"suggestions": []}, status=status.HTTP_200_OK)

        try:
            limit = min(int(request.query_params.get("limit", 10)), 20)
        except ValueError:
            limit = 10

        cache_key = RedisCacheService.generate_cache_key("suggestions", query, limit)
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)

        suggestions = UnifiedSearchEngine.get_suggestions(query, limit=limit)
        response_data = {"query": query, "suggestions": suggestions}

        RedisCacheService.set(cache_key, response_data, timeout=600)
        return Response(response_data, status=status.HTTP_200_OK)


class SearchHistoryAPIView(APIView):
    """
    Historique de recherche utilisateur (Exigence #10)
    GET /api/search/history/

    OPTIMISATIONS:
    - Historique limite a 10
    - Cache par utilisateur
    """

    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {"error": "Authentification requise"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            limit = min(int(request.query_params.get("limit", 10)), 10)
        except ValueError:
            limit = 10

        cache_key = RedisCacheService.generate_cache_key(
            "history",
            request.user.id,
            limit,
        )
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)

        response_data = {
            "history": SearchHistoryService.recent_history(
                user=request.user,
                limit=limit,
            )
        }

        RedisCacheService.set(cache_key, response_data, timeout=300)
        return Response(response_data, status=status.HTTP_200_OK)


class ReindexAPIView(APIView):
    """
    Endpoint admin pour reindexer toutes les donnees (Exigence #14)
    POST /api/search/reindex/
    Necessite permissions admin

    OPTIMISATIONS:
    - Invalide tout le cache apres reindexation
    """

    def post(self, request):
        if not request.user.is_authenticated or request.user.role != "ADMIN":
            return Response(
                {"error": "Permissions admin requises"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            from .indexer import SearchIndexer

            SearchIndexer.reindex_all()

            from .models import SearchIndex

            total = SearchIndex.objects.count()

            from core.cache import invalidate_cache_pattern

            invalidate_cache_pattern("search:*")
            invalidate_cache_pattern("live_search:*")
            invalidate_cache_pattern("suggestions:*")

            return Response(
                {
                    "message": "Reindexation terminee avec succes",
                    "total_indexed": total,
                    "cache_cleared": True,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": f"Erreur lors de la reindexation: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
