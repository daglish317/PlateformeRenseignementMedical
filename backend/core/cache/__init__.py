"""Cache utilities pour SantéProx"""
from .redis_service import (
    RedisCacheService,
    cache_result,
    invalidate_cache,
    invalidate_cache_pattern,
)

__all__ = [
    'RedisCacheService',
    'cache_result',
    'invalidate_cache',
    'invalidate_cache_pattern',
]
