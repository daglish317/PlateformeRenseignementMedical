from rest_framework.views import APIView
from rest_framework.response import Response

from search.services.search_service import SearchService
from search.suggestions.engine import SuggestionEngine


class SearchAPIView(APIView):

    def get(self, request):

        query = request.query_params.get("q")
        user_lat = request.query_params.get("lat")
        user_lon = request.query_params.get("lon")
        page = int(request.query_params.get("page", 1))
        page_size = min(int(request.query_params.get("page_size", 20)), 50)

        if not query:
            return Response({"detail": "Paramètre q requis"}, status=400)

        result = SearchService.search(
            query,
            user_lat=float(user_lat) if user_lat else None,
            user_lon=float(user_lon) if user_lon else None,
            page=page,
            page_size=page_size,
        )

        return Response(result)


class SuggestionAPIView(APIView):

    def get(self, request):

        query = request.query_params.get("q", "")
        suggestions = SuggestionEngine.get_suggestions(query)

        return Response([
            {"id": str(s.id), "nom": s.nom, "type": s.type}
            for s in suggestions
        ])
