from structures.models import StructureService

from search.utils.normalizer import normalize_query


class CatalogEngine:

    @staticmethod
    def find_by_query(query: str):
        query = normalize_query(query)
        if not query:
            return None
        return StructureService.objects.filter(
            est_actif=True,
            nom__icontains=query,
        ).first()
