from structures.models import StructureService

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


def _service_choices():
    return list(
        StructureService.objects.filter(est_actif=True).values_list("nom", flat=True)
    )


def _service_by_name():
    return {
        s.nom.lower(): s
        for s in StructureService.objects.filter(est_actif=True)
    }


def best_match(query: str, min_score: float = 0.55):
    query = normalize_query(query)
    if not query:
        return None

    services = StructureService.objects.filter(est_actif=True)
    best_item = None
    best_score = 0.0

    for svc in services:
        score = _score(query, svc.nom.lower())
        if query in svc.nom.lower():
            score = max(score, 0.85)
        if score > best_score:
            best_score = score
            best_item = svc

    if best_score >= min_score:
        return best_item
    return None


def suggest(query: str, limit: int = 5, min_score: float = 0.35):
    query = normalize_query(query)
    if not query:
        return []

    if HAS_RAPIDFUZZ:
        choices = _service_choices()
        results = process.extract(
            query,
            choices,
            scorer=fuzz.partial_ratio,
            limit=limit,
        )
        by_name = _service_by_name()
        items = []
        for name, score, _ in results:
            if score / 100.0 >= min_score:
                svc = by_name.get(name.lower())
                if svc:
                    items.append(svc)
        return items

    services = StructureService.objects.filter(est_actif=True)
    scored = []
    for svc in services:
        score = _score(query, svc.nom.lower())
        if score >= min_score:
            scored.append((score, svc))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [svc for _, svc in scored[:limit]]
