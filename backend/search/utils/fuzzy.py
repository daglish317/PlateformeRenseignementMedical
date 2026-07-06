from catalogues.models import Catalogue

from .normalizer import normalize_query

try:
    from rapidfuzz import fuzz, process
    HAS_RAPIDFUZZ = True
except ImportError:
    HAS_RAPIDFUZZ = False
    from difflib import SequenceMatcher


def _score(query: str, candidate: str) -> float:
    if HAS_RAPIDFUZZ:
        return fuzz.partial_ratio(query, candidate) / 100.0
    return SequenceMatcher(None, query, candidate).ratio()


def _catalogue_choices():
    return list(
        Catalogue.objects.filter(est_actif=True).values_list("nom", flat=True)
    )


def _catalogue_by_name():
    return {
        c.nom.lower(): c
        for c in Catalogue.objects.filter(est_actif=True)
    }


def best_match(query: str, min_score: float = 0.55):
    query = normalize_query(query)
    if not query:
        return None

    catalogues = Catalogue.objects.filter(est_actif=True)
    best_item = None
    best_score = 0.0

    for cat in catalogues:
        score = _score(query, cat.nom.lower())
        if query in cat.nom.lower():
            score = max(score, 0.85)
        if score > best_score:
            best_score = score
            best_item = cat

    if best_score >= min_score:
        return best_item
    return None


def suggest(query: str, limit: int = 5, min_score: float = 0.35):
    query = normalize_query(query)
    if not query:
        return []

    if HAS_RAPIDFUZZ:
        choices = _catalogue_choices()
        results = process.extract(
            query,
            choices,
            scorer=fuzz.partial_ratio,
            limit=limit,
        )
        by_name = _catalogue_by_name()
        items = []
        for name, score, _ in results:
            if score / 100.0 >= min_score:
                cat = by_name.get(name.lower())
                if cat:
                    items.append(cat)
        return items

    catalogues = Catalogue.objects.filter(est_actif=True)
    scored = []
    for cat in catalogues:
        score = _score(query, cat.nom.lower())
        if score >= min_score:
            scored.append((score, cat))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [cat for _, cat in scored[:limit]]
