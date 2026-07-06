from search.utils.fuzzy import suggest


class FallbackEngine:

    @staticmethod
    def suggest(query: str, limit=5):
        return suggest(query, limit=limit)
