"""
Vues publiques du moteur de recherche — médicament → pharmacies ouvertes.

Ces endpoints ne nécessitent aucune authentification et n'exposent que des
données publiques (§30) : aucune donnée interne de gestion n'est retournée.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .engines.public_pharmacy import PublicPharmacySearchEngine


def _photo_url(request, chemin):
    if not chemin:
        return None
    return request.build_absolute_uri(chemin)


class PublicPharmacySearchView(APIView):
    """Recherche paginée : pharmacies ouvertes disposant réellement du produit."""

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()

        try:
            user_lat = (
                float(request.query_params["lat"])
                if request.query_params.get("lat")
                else None
            )
        except ValueError:
            user_lat = None
        try:
            user_lon = (
                float(request.query_params["lon"])
                if request.query_params.get("lon")
                else None
            )
        except ValueError:
            user_lon = None

        try:
            page = max(int(request.query_params.get("page", 1)), 1)
        except ValueError:
            page = 1
        try:
            page_size = min(int(request.query_params.get("page_size", 20)), 50)
        except ValueError:
            page_size = 20

        resultat = PublicPharmacySearchEngine.search(
            query=query,
            user_lat=user_lat,
            user_lon=user_lon,
            page=page,
            page_size=page_size,
        )

        results = resultat["results"]
        for item in results:
            item["structure"]["photo"] = _photo_url(
                request, item["structure"]["photo"]
            )

        total = resultat["total"]
        offset = (page - 1) * page_size

        return Response(
            {
                "query": query,
                "normalized_query": resultat["normalized_query"],
                "results": results,
                "map_results": resultat.get("map_results", []),
                "total": total,
                "page": page,
                "page_size": page_size,
                "has_next": (offset + page_size) < total,
                "has_previous": page > 1,
                "user_location": (
                    {"lat": user_lat, "lon": user_lon}
                    if user_lat is not None and user_lon is not None
                    else None
                ),
            }
        )


class PublicSuggestionsView(APIView):
    """Suggestions de médicaments pendant la saisie (§5, §6)."""

    def get(self, request):
        query = (request.query_params.get("q") or "").strip()
        if len(query) < 1:
            return Response({"query": query, "suggestions": []})

        try:
            limit = min(int(request.query_params.get("limit", 8)), 15)
        except ValueError:
            limit = 8

        suggestions = PublicPharmacySearchEngine.suggestions(query, limite=limit)
        return Response({"query": query, "suggestions": suggestions})
