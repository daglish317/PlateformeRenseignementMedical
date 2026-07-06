from search.utils.fuzzy import suggest


class SuggestionEngine:

    @staticmethod
    def get_suggestions(query: str, limit=6):
        return suggest(query, limit=limit)
