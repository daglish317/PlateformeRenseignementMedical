"""
API Views pour le moteur de recherche unifié
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .engines.unified_engine import UnifiedSearchEngine
from .models import SearchLog


class UnifiedSearchAPIView(APIView):
    """
    Endpoint principal de recherche unifiée (Exigences #1-#17)
    GET /api/search/unified/?q=paracetamol&lat=3.8&lon=11.5
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
        
        # Effectuer la recherche
        result = UnifiedSearchEngine.search(
            query=query,
            user_lat=user_lat,
            user_lon=user_lon,
            limit=page_size,
            offset=offset,
        )
        
        # Logger la recherche (Exigence #10 - historique)
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
        
        return Response(result, status=status.HTTP_200_OK)


class LiveSearchAPIView(APIView):
    """
    Live search pour autocomplétion (Exigence #2, #6)
    GET /api/search/live/?q=par
    """
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({'suggestions': []}, status=status.HTTP_200_OK)
        
        try:
            limit = min(int(request.query_params.get('limit', 8)), 15)
        except ValueError:
            limit = 8
        
        suggestions = UnifiedSearchEngine.live_search(query, limit=limit)
        
        return Response({
            'query': query,
            'suggestions': suggestions,
        }, status=status.HTTP_200_OK)


class SearchSuggestionsAPIView(APIView):
    """
    Suggestions intelligentes (Exigence #6)
    GET /api/search/suggestions/?q=parace
    """
    
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        
        if not query:
            return Response({'suggestions': []}, status=status.HTTP_200_OK)
        
        try:
            limit = min(int(request.query_params.get('limit', 10)), 20)
        except ValueError:
            limit = 10
        
        suggestions = UnifiedSearchEngine.get_suggestions(query, limit=limit)
        
        return Response({
            'query': query,
            'suggestions': suggestions,
        }, status=status.HTTP_200_OK)


class SearchHistoryAPIView(APIView):
    """
    Historique de recherche utilisateur (Exigence #10)
    GET /api/search/history/
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
        
        # Récupérer l'historique de l'utilisateur
        history = SearchLog.objects.filter(
            user=request.user
        ).order_by('-created_at')[:limit]
        
        return Response({
            'history': [
                {
                    'query': log.query,
                    'search_type': log.search_type,
                    'results_count': log.results_count,
                    'created_at': log.created_at.isoformat(),
                }
                for log in history
            ]
        }, status=status.HTTP_200_OK)


class ReindexAPIView(APIView):
    """
    Endpoint admin pour réindexer toutes les données (Exigence #14)
    POST /api/search/reindex/
    Nécessite permissions admin
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
            
            return Response({
                'message': 'Réindexation terminée avec succès',
                'total_indexed': total,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': f'Erreur lors de la réindexation: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
