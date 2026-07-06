from search.utils.fuzzy import best_match


class FuzzyEngine:

    @staticmethod
    def best_match(query: str):
        return best_match(query)
