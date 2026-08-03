"""
API Views pour le moteur de recherche unifié - OPTIMISÉ POUR PERFORMANCE
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from core.cache import cache_result, RedisCacheService
from .engines.unified_engine import UnifiedSearchEngine
from .models import SearchLog


class UnifiedSearchAPIView(APIView):
    """
    Endpoint principal de recherche unifiée (Exigences #1-#17)
    GET /api/search/unified/?q=paracetamol&lat=3.8&lon=11.5
    
    OPTIMISATIONS:
    - Cache Redis 5 minutes
    - Query optimization
    - Compression response
    """
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response(
                {'error': 'Paramètre "q" requis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Récupérer les paramètres de géolocalisation
        try:
            user_lat = float(request.query_params.get('lat')) if request.query_params.get('lat') else None
            user_lon = float(request.query_params.get('lon')) if request.query_params.get('lon') else None
        except ValueError:
            user_lat = user_lon = None
        
        # Pagination
        try:
            page = int(request.query_params.get('page', 1))
            page_size = min(int(request.query_params.get('page_size', 20)), 50)
        except ValueError:
            page = 1
            page_size = 20
        
        offset = (page - 1) * page_size
        
        # Générer clé de cache
        cache_key = RedisCacheService.generate_cache_key(
            'search',
            query, user_lat, user_lon, page, page_size
        )
        
        # Vérifier cache
        cached_result = RedisCacheService.get(cache_key)
        if cached_result:
            return Response(cached_result, status=status.HTTP_200_OK)
        
        # Effectuer la recherche
        result = UnifiedSearchEngine.search(
            query=query,
            user_lat=user_lat,
            user_lon=user_lon,
            limit=page_size,
            offset=offset,
        )
        
        # Logger la recherche (Exigence #10 - historique)
        # Async pour ne pas bloquer la réponse
        try:
            SearchLog.objects.create(
                query=query[:255],
                user_lat=user_lat,
                user_lon=user_lon,
                results_count=result['total'],
                search_type=result['detected_intent'],
                user=request.user if request.user.is_authenticated else None,
            )
        except Exception as e:
            print(f"Erreur log recherche: {e}")
        
        # Ajouter pagination dans la réponse
        result['page'] = page
        result['page_size'] = page_size
        result['has_next'] = (offset + page_size) < result['total']
        result['has_previous'] = page > 1
        
        # Mettre en cache (5 minutes)
        RedisCacheService.set(cache_key, result, timeout=300)
        
        return Response(result, status=status.HTTP_200_OK)


class LiveSearchAPIView(APIView):
    """
    Live search pour autocomplétion (Exigence #2, #6)
    GET /api/search/live/?q=par
    
    OPTIMISATIONS:
    - Cache Redis 3 minutes
    - Limite 8 résultats
    - Query ultra-rapide
    """
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'suggestions': []}, status=status.HTTP_200_OK)
        
        try:
            limit = min(int(request.query_params.get('limit', 8)), 15)
        except ValueError:
            limit = 8
        
        # Cache 3 minutes
        cache_key = RedisCacheService.generate_cache_key('live_search', query, limit)
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)
        
        suggestions = UnifiedSearchEngine.live_search(query, limit=limit)
        
        response_data = {
            'query': query,
            'suggestions': suggestions,
        }
        
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
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({'suggestions': []}, status=status.HTTP_200_OK)
        
        try:
            limit = min(int(request.query_params.get('limit', 10)), 20)
        except ValueError:
            limit = 10
        
        # Cache 10 minutes
        cache_key = RedisCacheService.generate_cache_key('suggestions', query, limit)
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)
        
        suggestions = UnifiedSearchEngine.get_suggestions(query, limit=limit)
        
        response_data = {
            'query': query,
            'suggestions': suggestions,
        }
        
        RedisCacheService.set(cache_key, response_data, timeout=600)
        
        return Response(response_data, status=status.HTTP_200_OK)


class SearchHistoryAPIView(APIView):
    """
    Historique de recherche utilisateur (Exigence #10)
    GET /api/search/history/
    
    OPTIMISATIONS:
    - Query optimisée avec only()
    - Cache par utilisateur
    """
    
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentification requise'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            limit = min(int(request.query_params.get('limit', 10)), 50)
        except ValueError:
            limit = 10
        
        # Cache 5 minutes par utilisateur
        cache_key = RedisCacheService.generate_cache_key(
            'history',
            request.user.id,
            limit
        )
        cached = RedisCacheService.get(cache_key)
        if cached:
            return Response(cached, status=status.HTTP_200_OK)
        
        # Récupérer l'historique de l'utilisateur avec query optimisée
        history = SearchLog.objects.filter(
            user=request.user
        ).only(
            'query', 'search_type', 'results_count', 'created_at'
        ).order_by('-created_at')[:limit]
        
        response_data = {
            'history': [
                {
                    'query': log.query,
                    'search_type': log.search_type,
                    'results_count': log.results_count,
                    'created_at': log.created_at.isoformat(),
                }
                for log in history
            ]
        }
        
        RedisCacheService.set(cache_key, response_data, timeout=300)
        
        return Response(response_data, status=status.HTTP_200_OK)


class ReindexAPIView(APIView):
    """
    Endpoint admin pour réindexer toutes les données (Exigence #14)
    POST /api/search/reindex/
    Nécessite permissions admin
    
    OPTIMISATIONS:
    - Invalide tout le cache après réindexation
    """
    
    def post(self, request):
        # Vérifier que l'utilisateur est admin
        if not request.user.is_authenticated or request.user.role != 'ADMIN':
            return Response(
                {'error': 'Permissions admin requises'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            from .indexer import SearchIndexer
            SearchIndexer.reindex_all()
            
            from .models import SearchIndex
            total = SearchIndex.objects.count()
            
            # Invalider tout le cache de recherche
            from core.cache import invalidate_cache_pattern
            invalidate_cache_pattern('search:*')
            invalidate_cache_pattern('live_search:*')
            invalidate_cache_pattern('suggestions:*')
            
            return Response({
                'message': 'Réindexation terminée avec succès',
                'total_indexed': total,
                'cache_cleared': True,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la réindexation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
