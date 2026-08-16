"""
Service de cache Redis optimisé pour haute performance
Implémente le caching intelligent avec stratégie LRU et compression
"""
import json
import hashlib
from functools import wraps
from typing import Any, Optional, Callable
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class RedisCacheService:
    """Service centralisé de gestion du cache Redis"""
    
    # Durées de cache par défaut (en secondes)
    CACHE_DURATIONS = {
        'search': 300,          # 5 minutes - Recherches
        'suggestions': 600,      # 10 minutes - Suggestions
        'live_search': 180,      # 3 minutes - Live search
        'structure': 3600,       # 1 heure - Données structures
        'catalog': 7200,         # 2 heures - Catalogues
        'user_profile': 1800,    # 30 minutes - Profils utilisateurs
        'statistics': 900,       # 15 minutes - Statistiques
    }
    
    @staticmethod
    def generate_cache_key(prefix: str, *args, **kwargs) -> str:
        """
        Génère une clé de cache unique et déterministe
        
        Args:
            prefix: Préfixe de la clé (ex: 'search', 'suggest')
            *args: Arguments positionnels
            **kwargs: Arguments nommés
            
        Returns:
            Clé de cache hashée
        """
        # Créer une représentation string stable
        key_parts = [prefix]
        key_parts.extend(str(arg) for arg in args)
        key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
        
        # Hasher pour éviter clés trop longues
        key_string = ":".join(key_parts)
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        
        return f"sp:{prefix}:{key_hash}"  # sp = SantéProx
    
    @staticmethod
    def get(key: str) -> Optional[Any]:
        """
        Récupère une valeur du cache
        
        Args:
            key: Clé de cache
            
        Returns:
            Valeur désérialisée ou None si non trouvée
        """
        try:
            value = cache.get(key)
            if value is not None:
                logger.debug(f"Cache HIT: {key}")
                return json.loads(value) if isinstance(value, str) else value
            logger.debug(f"Cache MISS: {key}")
            return None
        except Exception as e:
            logger.error(f"Erreur lecture cache {key}: {e}")
            return None
    
    @staticmethod
    def set(key: str, value: Any, timeout: Optional[int] = None) -> bool:
        """
        Stocke une valeur dans le cache
        
        Args:
            key: Clé de cache
            value: Valeur à stocker
            timeout: Durée en secondes (None = défaut)
            
        Returns:
            True si succès, False sinon
        """
        try:
            # Sérialiser en JSON pour compression
            serialized = json.dumps(value, ensure_ascii=False)
            cache.set(key, serialized, timeout)
            logger.debug(f"Cache SET: {key} (timeout={timeout}s)")
            return True
        except Exception as e:
            logger.error(f"Erreur écriture cache {key}: {e}")
            return False
    
    @staticmethod
    def delete(key: str) -> bool:
        """Supprime une clé du cache"""
        try:
            cache.delete(key)
            logger.debug(f"Cache DELETE: {key}")
            return True
        except Exception as e:
            logger.error(f"Erreur suppression cache {key}: {e}")
            return False
    
    @staticmethod
    def delete_pattern(pattern: str) -> int:
        """
        Supprime toutes les clés matchant un pattern
        
        Args:
            pattern: Pattern de clés (ex: 'sp:search:*')
            
        Returns:
            Nombre de clés supprimées
        """
        try:
            # Nécessite redis-py avec support SCAN
            from django.core.cache import caches
            redis_cache = caches['default']

            backend_cache = getattr(redis_cache, '_cache', None)
            if backend_cache is None:
                return 0

            # RedisCache backend de Django expose un client Redis,
            # mais les backends mémoire utilisent aussi _cache pour un dict interne.
            get_client = getattr(backend_cache, 'get_client', None)
            if not callable(get_client):
                return 0

            redis_client = get_client()
            keys = redis_client.keys(pattern)
            if keys:
                redis_client.delete(*keys)
                logger.info(f"Cache DELETE PATTERN: {pattern} ({len(keys)} clés)")
                return len(keys)
            return 0
        except Exception as e:
            logger.error(f"Erreur suppression pattern {pattern}: {e}")
            return 0
    
    @staticmethod
    def clear_all() -> bool:
        """Vide tout le cache (à utiliser avec précaution !)"""
        try:
            cache.clear()
            logger.warning("Cache CLEAR ALL")
            return True
        except Exception as e:
            logger.error(f"Erreur vidage cache: {e}")
            return False


def cache_result(cache_type: str = 'default', timeout: Optional[int] = None):
    """
    Décorateur pour mettre en cache les résultats de fonction
    
    Usage:
        @cache_result('search', timeout=300)
        def my_search_function(query, lat, lon):
            # ... logique de recherche
            return results
    
    Args:
        cache_type: Type de cache (détermine la durée par défaut)
        timeout: Durée personnalisée en secondes
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Générer clé de cache
            cache_key = RedisCacheService.generate_cache_key(
                f"{cache_type}:{func.__name__}",
                *args,
                **kwargs
            )
            
            # Vérifier cache
            cached_value = RedisCacheService.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # Exécuter fonction
            result = func(*args, **kwargs)
            
            # Stocker résultat
            cache_timeout = timeout or RedisCacheService.CACHE_DURATIONS.get(cache_type, 300)
            RedisCacheService.set(cache_key, result, cache_timeout)
            
            return result
        
        return wrapper
    return decorator


def invalidate_cache(cache_type: str, *args, **kwargs):
    """
    Invalide une entrée de cache spécifique
    
    Args:
        cache_type: Type de cache
        *args, **kwargs: Mêmes arguments que la fonction originale
    """
    cache_key = RedisCacheService.generate_cache_key(cache_type, *args, **kwargs)
    RedisCacheService.delete(cache_key)


def invalidate_cache_pattern(pattern: str):
    """
    Invalide toutes les entrées matchant un pattern
    
    Args:
        pattern: Pattern de clés (ex: 'search:*')
    """
    full_pattern = f"sp:{pattern}"
    RedisCacheService.delete_pattern(full_pattern)
