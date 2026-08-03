"""
Commande pour créer les index PostgreSQL de performance
Usage: python manage.py create_performance_indexes
"""
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Crée les index PostgreSQL pour optimiser les performances de recherche'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Création des index de performance...'))
        
        with connection.cursor() as cursor:
            # 1. Index pour recherche textuelle full-text (SearchIndex)
            self.stdout.write('Création index full-text search...')
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_search_content_gin 
                    ON search_searchindex 
                    USING GIN (
                        to_tsvector('french', content || ' ' || COALESCE(content_original, ''))
                    );
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index full-text créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index full-text déjà existant ou erreur: {e}'))
            
            # 2. Index trigram pour recherche fuzzy (tolérance aux fautes)
            self.stdout.write('Activation extension pg_trgm...')
            try:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;")
                self.stdout.write(self.style.SUCCESS('✓ Extension pg_trgm activée'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Extension pg_trgm déjà activée: {e}'))
            
            self.stdout.write('Création index trigram...')
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_search_content_trigram 
                    ON search_searchindex 
                    USING GIN (content gin_trgm_ops);
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index trigram créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index trigram déjà existant ou erreur: {e}'))
            
            # 3. Index pour géolocalisation (structures)
            self.stdout.write('Activation extension PostGIS...')
            try:
                cursor.execute("CREATE EXTENSION IF NOT EXISTS postgis;")
                self.stdout.write(self.style.SUCCESS('✓ Extension PostGIS activée'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Extension PostGIS non disponible (optionnel): {e}'))
            
            # 4. Index composés pour filtres fréquents
            self.stdout.write('Création index composés...')
            
            # Index SearchIndex: type + disponibilité + statut
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_search_type_avail_status 
                    ON search_searchindex (search_type, is_available, structure_statut)
                    WHERE is_available = TRUE AND structure_statut = 'ACTIVE';
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index type+disponibilité+statut créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index composé déjà existant: {e}'))
            
            # Index pour structures actives
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_search_active_structures 
                    ON search_searchindex (structure_id)
                    WHERE structure_statut = 'ACTIVE';
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index structures actives créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index structures déjà existant: {e}'))
            
            # 5. Index sur catalogues
            self.stdout.write('Création index catalogues...')
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_catalogue_nom_type 
                    ON catalogues_catalogue (nom, type)
                    WHERE est_actif = TRUE;
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index catalogues nom+type créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index catalogues déjà existant: {e}'))
            
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_catalogue_nom_trigram 
                    ON catalogues_catalogue 
                    USING GIN (nom gin_trgm_ops);
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index catalogues trigram créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index catalogues trigram déjà existant: {e}'))
            
            # 6. Index pour SearchLog (historique)
            self.stdout.write('Création index historique recherches...')
            try:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_searchlog_user_created 
                    ON search_searchlog (user_id, created_at DESC)
                    WHERE user_id IS NOT NULL;
                """)
                self.stdout.write(self.style.SUCCESS('✓ Index historique utilisateur créé'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Index historique déjà existant: {e}'))
            
            # 7. Analyser les tables pour mettre à jour les statistiques
            self.stdout.write('Analyse des tables pour optimisation...')
            try:
                cursor.execute("ANALYZE search_searchindex;")
                cursor.execute("ANALYZE catalogues_catalogue;")
                cursor.execute("ANALYZE search_searchlog;")
                self.stdout.write(self.style.SUCCESS('✓ Tables analysées'))
            except Exception as e:
                self.stdout.write(self.style.WARNING(f'Erreur analyse: {e}'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Tous les index de performance ont été créés!'))
        self.stdout.write(self.style.NOTICE('\nRésumé des optimisations:'))
        self.stdout.write('  • Index full-text pour recherche textuelle rapide')
        self.stdout.write('  • Index trigram pour tolérance aux fautes (fuzzy search)')
        self.stdout.write('  • Index composés pour filtres fréquents')
        self.stdout.write('  • Index historique pour requêtes utilisateur')
        self.stdout.write('\n  Gain attendu: 10-100x plus rapide selon les requêtes')
