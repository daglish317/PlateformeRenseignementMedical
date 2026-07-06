from django.core.cache import cache


class RateLimiter:

    @staticmethod
    def is_allowed(key: str, max_attempts: int, window_seconds: int) -> bool:
        cache_key = f"rate:{key}"
        attempts = cache.get(cache_key, 0)
        if attempts >= max_attempts:
            return False
        cache.set(cache_key, attempts + 1, window_seconds)
        return True

    @staticmethod
    def reset(key: str):
        cache.delete(f"rate:{key}")
