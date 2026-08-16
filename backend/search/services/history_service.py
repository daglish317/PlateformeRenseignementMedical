from search.models import SearchLog
from core.utils.text import normaliser_texte


class SearchHistoryService:
    MAX_HISTORY = 10

    @staticmethod
    def record_search(*, user, query, results_count=0, search_type=""):
        if not user or not getattr(user, "is_authenticated", False):
            return None

        normalized_query = normaliser_texte(query)
        existing = list(
            SearchLog.objects.filter(user=user)
            .only("id", "query")
            .order_by("-created_at")[:50]
        )

        for log in existing:
            if normaliser_texte(log.query) == normalized_query:
                SearchLog.objects.filter(id=log.id).delete()

        SearchLog.objects.create(
            user=user,
            query=(query or "")[:255],
            results_count=results_count,
            search_type=search_type or "",
        )

        surplus = list(
            SearchLog.objects.filter(user=user)
            .only("id")
            .order_by("-created_at")[SearchHistoryService.MAX_HISTORY :]
        )
        if surplus:
            SearchLog.objects.filter(id__in=[log.id for log in surplus]).delete()

    @staticmethod
    def recent_history(*, user, limit=10):
        if not user or not getattr(user, "is_authenticated", False):
            return []

        limit = min(max(int(limit or 10), 1), SearchHistoryService.MAX_HISTORY)
        logs = (
            SearchLog.objects.filter(user=user)
            .only("query", "search_type", "results_count", "created_at")
            .order_by("-created_at")
        )

        seen = set()
        history = []
        for log in logs:
            key = normaliser_texte(log.query)
            if key in seen:
                continue
            seen.add(key)
            history.append(log)
            if len(history) >= limit:
                break

        return [
            {
                "query": log.query,
                "search_type": log.search_type,
                "results_count": log.results_count,
                "created_at": log.created_at.isoformat(),
            }
            for log in history
        ]
