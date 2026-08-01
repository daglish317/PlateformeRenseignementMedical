"""
Commande d'initialisation du moteur de recherche
Usage: python manage.py init_search
"""
from django.core.management.base import BaseCommand
from search.models import SearchSynonym, IntentPattern
from search.indexer import SearchIndexer


class Command(BaseCommand):
    help = 'Initialise le moteur de recherche (synonymes, patterns, index)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🚀 Initialisation du moteur de recherche...'))
        
        # 1. Créer les synonymes médicaux de base
        self.stdout.write('\n📚 Création des synonymes médicaux...')
        synonyms_data = [
            {
                'term': 'mal de tete',
                'synonyms': ['cephalee', 'migraine', 'cephalalgie'],
                'category': 'symptome'
            },
            {
                'term': 'fievre',
                'synonyms': ['temperature', 'hyperthermie', 'pyrexie'],
                'category': 'symptome'
            },
            {
                'term': 'paracetamol',
                'synonyms': ['acetaminophene', 'doliprane', 'efferalgan', 'dafalgan'],
                'category': 'medicament'
            },
            {
                'term': 'ibuprofene',
                'synonyms': ['advil', 'nurofen', 'brufen'],
                'category': 'medicament'
            },
            {
                'term': 'cardiologue',
                'synonyms': ['cardiologie', 'specialiste coeur', 'medecin coeur'],
                'category': 'specialite'
            },
            {
                'term': 'pediatre',
                'synonyms': ['pediatrie', 'medecin enfant', 'docteur enfant'],
                'category': 'specialite'
            },
            {
                'term': 'gyneco',
                'synonyms': ['gynecologue', 'gynecologie', 'medecin femme'],
                'category': 'specialite'
            },
            {
                'term': 'radio',
                'synonyms': ['radiographie', 'radiologie', 'rayon x'],
                'category': 'examen'
            },
            {
                'term': 'echo',
                'synonyms': ['echographie', 'echographe', 'ultrason'],
                'category': 'examen'
            },
            {
                'term': 'prise de sang',
                'synonyms': ['analyse sanguine', 'bilan sanguin', 'hemogramme'],
                'category': 'analyse'
            },
        ]
        
        created_synonyms = 0
        for syn_data in synonyms_data:
            obj, created = SearchSynonym.objects.get_or_create(
                term=syn_data['term'],
                defaults={
                    'synonyms': syn_data['synonyms'],
                    'category': syn_data['category'],
                    'is_active': True
                }
            )
            if created:
                created_synonyms += 1
                self.stdout.write(f'  ✓ {syn_data["term"]} -> {", ".join(syn_data["synonyms"][:2])}...')
        
        self.stdout.write(self.style.SUCCESS(f'✅ {created_synonyms} synonymes créés'))
        
        # 2. Créer les patterns d'intention
        self.stdout.write('\n🎯 Création des patterns d\'intention...')
        patterns_data = [
            {
                'pattern': 'j\'ai mal',
                'intent_type': 'SYMPTOM_SEARCH',
                'target_search_type': 'MALADIE',
                'priority': 10
            },
            {
                'pattern': 'je souffre',
                'intent_type': 'SYMPTOM_SEARCH',
                'target_search_type': 'MALADIE',
                'priority': 10
            },
            {
                'pattern': 'ou trouver',
                'intent_type': 'MEDICATION_SEARCH',
                'target_search_type': 'MEDICAMENT',
                'priority': 9
            },
            {
                'pattern': 'ou acheter',
                'intent_type': 'MEDICATION_SEARCH',
                'target_search_type': 'MEDICAMENT',
                'priority': 9
            },
            {
                'pattern': 'besoin de',
                'intent_type': 'MEDICATION_SEARCH',
                'target_search_type': 'MEDICAMENT',
                'priority': 8
            },
            {
                'pattern': 'fracture',
                'intent_type': 'EMERGENCY',
                'target_search_type': 'SERVICE_MEDICAL',
                'priority': 15
            },
            {
                'pattern': 'urgence',
                'intent_type': 'EMERGENCY',
                'target_search_type': 'SERVICE_MEDICAL',
                'priority': 15
            },
            {
                'pattern': 'ouvert',
                'intent_type': 'AVAILABILITY_SEARCH',
                'target_search_type': 'ALL',
                'priority': 7
            },
            {
                'pattern': 'de garde',
                'intent_type': 'AVAILABILITY_SEARCH',
                'target_search_type': 'MEDICAMENT',
                'priority': 8
            },
        ]
        
        created_patterns = 0
        for pattern_data in patterns_data:
            obj, created = IntentPattern.objects.get_or_create(
                pattern=pattern_data['pattern'],
                defaults={
                    'intent_type': pattern_data['intent_type'],
                    'target_search_type': pattern_data['target_search_type'],
                    'priority': pattern_data['priority'],
                    'is_active': True
                }
            )
            if created:
                created_patterns += 1
                self.stdout.write(f'  ✓ "{pattern_data["pattern"]}" -> {pattern_data["intent_type"]}')
        
        self.stdout.write(self.style.SUCCESS(f'✅ {created_patterns} patterns créés'))
        
        # 3. Réindexer toutes les données
        self.stdout.write('\n🔄 Réindexation de toutes les données...')
        try:
            SearchIndexer.reindex_all()
            self.stdout.write(self.style.SUCCESS('✅ Réindexation terminée'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Erreur lors de la réindexation: {e}'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Initialisation terminée avec succès !'))
        self.stdout.write('\nVous pouvez maintenant utiliser le moteur de recherche unifié.')
        self.stdout.write('Endpoint: GET /api/search/unified/?q=paracetamol&lat=3.8&lon=11.5')
