"""
Utilitaires d'optimisation des requêtes Django
Évite le problème N+1 et améliore drastiquement les performances
"""
from django.db.models import Prefetch, Q, Count, Avg
from typing import Any, List


class QueryOptimizer:
    """
    Classe helper pour optimiser les requêtes Django
    
    Principes:
    - select_related() pour relations ForeignKey/OneToOne
    - prefetch_related() pour relations ManyToMany/reverse ForeignKey
    - only() pour limiter les champs chargés
    - defer() pour exclure des champs lourds
    """
    
    @staticmethod
    def optimize_structure_query(queryset):
        """
        Optimise une requête de structures avec toutes ses relations
        
        Usage:
            structures = QueryOptimizer.optimize_structure_query(
                Structure.objects.filter(...)
            )
        
        Gain: Passe de N+1 queries à 1-2 queries
        """
        return queryset.select_related(
            'gestionnaire',  # ForeignKey vers Utilisateur
        ).prefetch_related(
            'services',  # ManyToMany vers ServiceMedical
            'analyses',  # ManyToMany vers Analyse
            'horaires',  # Reverse ForeignKey
        ).only(
            # Charger seulement les champs nécessaires
            'id', 'nom', 'type', 'adresse', 'telephone',
            'latitude', 'longitude', 'statut', 'est_actif',
            'gestionnaire__id', 'gestionnaire__nom', 'gestionnaire__email',
        )
    
    @staticmethod
    def optimize_search_index_query(queryset):
        """
        Optimise une requête de SearchIndex
        
        Le SearchIndex dénormalise déjà les données, donc pas besoin
        de select_related, juste limiter les champs
        """
        return queryset.only(
            'id', 'content', 'content_original', 'search_type',
            'structure_id', 'structure_nom', 'structure_type',
            'structure_adresse', 'structure_telephone',
            'structure_latitude', 'structure_longitude',
            'is_available', 'quantity', 'metadata',
            'structure_statut',
        )
    
    @staticmethod
    def optimize_catalogue_query(queryset):
        """Optimise une requête de catalogues"""
        return queryset.only(
            'id', 'nom', 'type', 'description', 'est_actif'
        )
    
    @staticmethod
    def optimize_user_query(queryset):
        """
        Optimise une requête d'utilisateurs
        
        Attention: Ne jamais charger le password!
        """
        return queryset.only(
            'id', 'email', 'nom', 'prenom', 'role',
            'telephone', 'est_actif', 'date_creation',
        ).defer(
            'password',  # Ne JAMAIS charger le hash du password
        )
    
    @staticmethod
    def optimize_search_log_query(queryset):
        """Optimise l'historique de recherche"""
        return queryset.select_related(
            'user'  # ForeignKey vers Utilisateur
        ).only(
            'id', 'query', 'search_type', 'results_count',
            'created_at', 'user_id',
            'user__id', 'user__email', 'user__nom',
        )
    
    @staticmethod
    def bulk_create_optimized(model, objects: List[Any], batch_size: int = 1000):
        """
        Création en masse optimisée
        
        Usage:
            QueryOptimizer.bulk_create_optimized(
                SearchIndex,
                [SearchIndex(...), SearchIndex(...), ...],
                batch_size=1000
            )
        
        Gain: 100x plus rapide que des .create() individuels
        """
        return model.objects.bulk_create(objects, batch_size=batch_size)
    
    @staticmethod
    def bulk_update_optimized(model, objects: List[Any], fields: List[str], batch_size: int = 1000):
        """
        Mise à jour en masse optimisée
        
        Usage:
            # Modifier les objets
            for obj in structures:
                obj.statut = 'ACTIVE'
            
            # Sauvegarder en masse
            QueryOptimizer.bulk_update_optimized(
                Structure,
                structures,
                fields=['statut'],
                batch_size=1000
            )
        
        Gain: 100x plus rapide que des .save() individuels
        """
        return model.objects.bulk_update(objects, fields, batch_size=batch_size)


class QueryPerformanceAnalyzer:
    """
    Analyseur de performance des requêtes
    À utiliser en développement pour détecter les problèmes N+1
    """
    
    @staticmethod
    def count_queries(func):
        """
        Décorateur pour compter les requêtes SQL
        
        Usage:
            @QueryPerformanceAnalyzer.count_queries
            def my_view(request):
                structures = Structure.objects.all()
                for s in structures:
                    print(s.gestionnaire.nom)  # N+1 problem!
        """
        from functools import wraps
        from django.db import connection
        from django.test.utils import override_settings
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Activer le logging des queries
            queries_before = len(connection.queries)
            
            result = func(*args, **kwargs)
            
            queries_after = len(connection.queries)
            queries_count = queries_after - queries_before
            
            print(f"\n{'='*60}")
            print(f"Fonction: {func.__name__}")
            print(f"Nombre de requêtes SQL: {queries_count}")
            
            if queries_count > 10:
                print(f"⚠️  ATTENTION: Trop de requêtes! Possible problème N+1")
                print(f"    Utilisez select_related() ou prefetch_related()")
            elif queries_count <= 3:
                print(f"✅ Excellent! Requêtes optimisées")
            else:
                print(f"✓  Acceptable")
            
            print(f"{'='*60}\n")
            
            return result
        
        return wrapper
    
    @staticmethod
    def explain_query(queryset):
        """
        Affiche le plan d'exécution PostgreSQL
        
        Usage:
            QueryPerformanceAnalyzer.explain_query(
                Structure.objects.filter(type='HOPITAL')
            )
        """
        from django.db import connection
        
        query = str(queryset.query)
        
        with connection.cursor() as cursor:
            cursor.execute(f"EXPLAIN ANALYZE {query}")
            plan = cursor.fetchall()
        
        print("\n" + "="*60)
        print("PLAN D'EXÉCUTION PostgreSQL:")
        print("="*60)
        for row in plan:
            print(row[0])
        print("="*60 + "\n")


# Exemples d'utilisation documentés
"""
EXEMPLES D'UTILISATION:

1. Optimiser une requête de structures:
   
   # ❌ MAUVAIS (N+1 queries)
   structures = Structure.objects.filter(type='HOPITAL')
   for s in structures:
       print(s.gestionnaire.nom)  # 1 query supplémentaire par structure!
   
   # ✅ BON (1-2 queries)
   structures = QueryOptimizer.optimize_structure_query(
       Structure.objects.filter(type='HOPITAL')
   )
   for s in structures:
       print(s.gestionnaire.nom)  # Déjà chargé!


2. Créer des objets en masse:
   
   # ❌ MAUVAIS (1 query par objet)
   for data in big_list:
       SearchIndex.objects.create(**data)
   
   # ✅ BON (1 query pour 1000 objets)
   objects = [SearchIndex(**data) for data in big_list]
   QueryOptimizer.bulk_create_optimized(SearchIndex, objects)


3. Analyser les performances:
   
   @QueryPerformanceAnalyzer.count_queries
   def my_view(request):
       structures = Structure.objects.all()
       # ... votre code
       return Response(...)


4. Charger seulement les champs nécessaires:
   
   # ❌ MAUVAIS (charge tous les champs)
   structures = Structure.objects.all()
   
   # ✅ BON (charge seulement id, nom, type)
   structures = Structure.objects.only('id', 'nom', 'type')


5. Exclure des champs lourds:
   
   # ✅ BON (exclut les champs lourds comme description longue)
   structures = Structure.objects.defer('description', 'metadata')
"""
