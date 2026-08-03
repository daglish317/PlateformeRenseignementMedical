#!/usr/bin/env python
"""
Script de test de performance automatisé
Vérifie que toutes les optimisations sont actives et fonctionnelles

Usage: python test_performance.py
"""
import os
import sys
import time
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'renseignementmedical.settings')
django.setup()

from django.core.cache import cache
from django.db import connection
from django.test.utils import override_settings
from core.cache import RedisCacheService
from search.models import SearchIndex


class Colors:
    """Couleurs pour terminal"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'


def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")


def print_success(text):
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")


def print_error(text):
    print(f"{Colors.RED}✗ {text}{Colors.END}")


def print_warning(text):
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")


def test_redis_connection():
    """Test 1: Connexion Redis"""
    print_header("TEST 1: Connexion Redis")
    
    try:
        # Test simple set/get
        test_key = 'performance_test_key'
        test_value = {'test': 'data', 'timestamp': time.time()}
        
        RedisCacheService.set(test_key, test_value, timeout=60)
        result = RedisCacheService.get(test_key)
        
        if result and result.get('test') == 'data':
            print_success("Redis connecté et fonctionnel")
            RedisCacheService.delete(test_key)
            return True
        else:
            print_error("Redis ne retourne pas les bonnes données")
            return False
    except Exception as e:
        print_error(f"Erreur connexion Redis: {e}")
        print_warning("Vérifiez que Redis est démarré: redis-cli ping")
        return False


def test_cache_performance():
    """Test 2: Performance du cache"""
    print_header("TEST 2: Performance du Cache")
    
    try:
        # Test sans cache
        start = time.time()
        results_nocache = list(SearchIndex.objects.filter(is_available=True)[:100])
        time_nocache = (time.time() - start) * 1000  # ms
        
        # Test avec cache
        cache_key = RedisCacheService.generate_cache_key('perf_test', 'test_query')
        RedisCacheService.set(cache_key, results_nocache, timeout=60)
        
        start = time.time()
        results_cached = RedisCacheService.get(cache_key)
        time_cached = (time.time() - start) * 1000  # ms
        
        speedup = time_nocache / time_cached if time_cached > 0 else 0
        
        print(f"  Temps sans cache: {time_nocache:.2f}ms")
        print(f"  Temps avec cache: {time_cached:.2f}ms")
        print(f"  Accélération: {speedup:.1f}x")
        
        if speedup > 5:
            print_success(f"Cache très performant ({speedup:.1f}x plus rapide)")
            RedisCacheService.delete(cache_key)
            return True
        else:
            print_warning(f"Cache peu performant ({speedup:.1f}x)")
            return False
    except Exception as e:
        print_error(f"Erreur test cache: {e}")
        return False


def test_database_indexes():
    """Test 3: Index PostgreSQL"""
    print_header("TEST 3: Index PostgreSQL")
    
    try:
        with connection.cursor() as cursor:
            # Vérifier les index critiques
            cursor.execute("""
                SELECT indexname 
                FROM pg_indexes 
                WHERE tablename = 'search_searchindex'
                AND indexname LIKE 'idx_%'
            """)
            indexes = [row[0] for row in cursor.fetchall()]
            
            required_indexes = [
                'idx_search_content_gin',
                'idx_search_content_trigram',
                'idx_search_type_avail_status',
            ]
            
            missing = [idx for idx in required_indexes if idx not in indexes]
            
            if not missing:
                print_success(f"Tous les index critiques présents ({len(indexes)} index)")
                for idx in indexes:
                    print(f"    • {idx}")
                return True
            else:
                print_error(f"Index manquants: {', '.join(missing)}")
                print_warning("Exécutez: python manage.py create_performance_indexes")
                return False
    except Exception as e:
        print_error(f"Erreur vérification index: {e}")
        return False


def test_gzip_compression():
    """Test 4: Compression GZIP"""
    print_header("TEST 4: Compression GZIP")
    
    from django.conf import settings
    
    if 'django.middleware.gzip.GZipMiddleware' in settings.MIDDLEWARE:
        print_success("Middleware GZIP activé")
        return True
    else:
        print_error("Middleware GZIP non activé")
        print_warning("Ajoutez 'django.middleware.gzip.GZipMiddleware' dans MIDDLEWARE")
        return False


def test_connection_pooling():
    """Test 5: Connection Pooling"""
    print_header("TEST 5: Connection Pooling")
    
    from django.conf import settings
    
    db_config = settings.DATABASES.get('default', {})
    conn_max_age = db_config.get('CONN_MAX_AGE', 0)
    
    if conn_max_age > 0:
        print_success(f"Connection pooling activé (CONN_MAX_AGE={conn_max_age}s)")
        return True
    else:
        print_warning("Connection pooling désactivé (CONN_MAX_AGE=0)")
        print_warning("Recommandé: CONN_MAX_AGE=600 (10 minutes)")
        return False


def test_query_performance():
    """Test 6: Performance des requêtes"""
    print_header("TEST 6: Performance des Requêtes")
    
    try:
        # Reset query counter
        connection.queries_log.clear()
        
        # Requête simple
        with override_settings(DEBUG=True):
            start = time.time()
            results = list(SearchIndex.objects.filter(
                is_available=True,
                search_type='MEDICAMENT'
            )[:20])
            query_time = (time.time() - start) * 1000  # ms
            query_count = len(connection.queries)
        
        print(f"  Temps de requête: {query_time:.2f}ms")
        print(f"  Nombre de queries SQL: {query_count}")
        
        if query_time < 100 and query_count <= 3:
            print_success("Performances excellentes")
            return True
        elif query_time < 200:
            print_warning("Performances acceptables")
            return True
        else:
            print_error("Performances faibles")
            return False
    except Exception as e:
        print_error(f"Erreur test requêtes: {e}")
        return False


def test_search_engine():
    """Test 7: Moteur de recherche"""
    print_header("TEST 7: Moteur de Recherche")
    
    try:
        from search.engines.unified_engine import UnifiedSearchEngine
        
        # Test recherche simple
        start = time.time()
        results = UnifiedSearchEngine.search(
            query='paracetamol',
            user_lat=3.8,
            user_lon=11.5,
            limit=20
        )
        search_time = (time.time() - start) * 1000  # ms
        
        print(f"  Temps de recherche: {search_time:.2f}ms")
        print(f"  Résultats trouvés: {results['total']}")
        print(f"  Intention détectée: {results['detected_intent']}")
        
        if search_time < 200:
            print_success("Moteur de recherche rapide")
            return True
        else:
            print_warning("Moteur de recherche lent")
            return False
    except Exception as e:
        print_error(f"Erreur test moteur: {e}")
        return False


def run_all_tests():
    """Exécute tous les tests"""
    print(f"\n{Colors.BOLD}🚀 TEST DE PERFORMANCE - SantéProx Backend{Colors.END}")
    print(f"{Colors.BOLD}{'='*60}{Colors.END}")
    
    tests = [
        ("Redis Connection", test_redis_connection),
        ("Cache Performance", test_cache_performance),
        ("Database Indexes", test_database_indexes),
        ("GZIP Compression", test_gzip_compression),
        ("Connection Pooling", test_connection_pooling),
        ("Query Performance", test_query_performance),
        ("Search Engine", test_search_engine),
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print_error(f"Erreur critique dans {name}: {e}")
            results[name] = False
    
    # Résumé
    print_header("RÉSUMÉ")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    percentage = (passed / total) * 100
    
    for name, result in results.items():
        status = f"{Colors.GREEN}✓ PASS{Colors.END}" if result else f"{Colors.RED}✗ FAIL{Colors.END}"
        print(f"  {name:.<40} {status}")
    
    print(f"\n{Colors.BOLD}Score: {passed}/{total} ({percentage:.0f}%){Colors.END}")
    
    if percentage == 100:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 EXCELLENT ! Toutes les optimisations sont actives{Colors.END}")
        print(f"{Colors.GREEN}Votre backend est prêt pour production !{Colors.END}")
    elif percentage >= 80:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠ BON. Quelques optimisations manquantes{Colors.END}")
        print(f"{Colors.YELLOW}Corrigez les tests échoués pour des performances optimales{Colors.END}")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ ATTENTION ! Plusieurs optimisations manquantes{Colors.END}")
        print(f"{Colors.RED}Suivez le guide BACKEND_OPTIMISATION_GUIDE.md{Colors.END}")
    
    print(f"\n{Colors.BOLD}{'='*60}{Colors.END}\n")
    
    return percentage >= 80


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
