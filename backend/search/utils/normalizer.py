import re


def normalize_query(query: str) -> str:
    if not query:
        return ""
    q = query.lower().strip()
    q = re.sub(r"[^\w\sàâäéèêëïîôùûüç-]", " ", q, flags=re.UNICODE)
    return " ".join(q.split())
