"""
Moteur de recherche unifié et intelligent (Exigences #2, #3, #4, #6, #9, #12, #16, #17)
Une seule barre de recherche qui comprend automatiquement l'intention
"""
import re
from django.db.models import Q, F, ExpressionWrapper, FloatField
from django.db.models.functions import Power, Sqrt
from django.contrib.postgres.search import SearchQuery, SearchRank, TrigramSimilarity
from ..models import SearchIndex, IntentPattern, SearchSynonym
from ..indexer import SearchIndexer


class UnifiedSearchEngine:
    """Moteur de recherche principal"""
    
    # Patterns conversationnels (Exigence #17)
    INTENT_PATTERNS = {
        'medication': [
            r'\b(où|ou)\s+(trouver|acheter|avoir)\s+',
            r'\b(besoin|cherche|veux)\s+.*(medicament|médicament|pilule|comprimé)',
            r'\b(paracetamol|ibuprofene|aspirine|doliprane)',
        ],
        'symptom': [
            r'\b(j\'ai|jai)\s+(mal|douleur)',
            r'\b(je\s+souffre|malade)',
            r'\b(fracture|fievre|toux|rhume|grippe)',
        ],
        'service': [
            r'\b(cardio|gynecologue|pediatre|dentiste|dermato)',
            r'\b(consultation|examen|analyse)',
        ],
        'availability': [
            r'\b(ouvert|ouverte|disponible|garde)',
            r'\b(maintenant|aujourd\'hui|ce\s+soir)',
        ],
        'location': [
            r'\b(yaounde|douala|bafoussam|garoua|bamenda)',
            r'\b(proche|pres|autour)',
        ],
    }
    
    @staticmethod
    def detect_intent(query: str) -> str:
        """
        Détection automatique de l'intention (Exigence #9, #12, #17)
        Returns: type de recherche détecté
        """
        query_lower = query.lower()
        
        # Check patterns conversationnels
        for intent_type, patterns in UnifiedSearchEngine.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    return intent_type
        
        # Check database patterns
        db_patterns = IntentPattern.objects.filter(is_active=True).order_by('-priority')
        for pattern in db_patterns:
            if pattern.pattern.lower() in query_lower:
                return pattern.target_search_type
        
        # Détection par mots-clés simples
        if any(word in query_lower for word in ['paracetamol', 'medicament', 'comprime', 'sirop', 'gelule']):
            return 'MEDICAMENT'
        
        if any(word in query_lower for word in ['cardio', 'gynecologue', 'pediatre', 'chirurgie', 'urgence']):
            return 'SERVICE_MEDICAL'
        
        if any(word in query_lower for word in ['analyse', 'test', 'examen', 'radio', 'scanner', 'echo']):
            return 'ANALYSE'
        
        # Par défaut, recherche générale
        return 'ALL'
    
    
    @staticmethod
    def expand_query_with_synonyms(query: str) -> list:
        """
        Expansion de requête avec synonymes (Exigence #15, #17)
        "mal de tête" -> ["mal de tête", "céphalée", "migraine"]
        """
        query_normalized = SearchIndexer.normalize_text(query)
        terms = [query, query_normalized]
        
        # Chercher des synonymes
        synonyms = SearchSynonym.objects.filter(
            Q(term__icontains=query_normalized) | Q(synonyms__icontains=query_normalized),
            is_active=True
        )
        
        for syn in synonyms:
            terms.append(syn.term)
            terms.extend(syn.synonyms)
        
        return list(set(terms))  # Dédupliquer
    
    
    @staticmethod
    def extract_location_from_query(query: str):
        """
        Extraire la localisation de la requête (Exigence #16)
        "Paracétamol Yaoundé" -> ("Paracétamol", "Yaoundé")
        """
        locations = ['yaounde', 'douala', 'bafoussam', 'garoua', 'bamenda', 'ngaoundere', 'maroua']
        query_lower = query.lower()
        
        for location in locations:
            if location in query_lower:
                # Retirer la localisation de la requête
                main_query = query_lower.replace(location, '').strip()
                return main_query, location
        
        return query, None
    
    
    @staticmethod
    def parse_multi_word_query(query: str) -> dict:
        """
        Parser requêtes complexes (Exigence #16)
        "Paracétamol 500mg ouvert" -> {term: "Paracétamol 500mg", filters: ["ouvert"]}
        """
        query_lower = query.lower()
        
        filters = {
            'is_open': False,
            'urgence': False,
            'garde': False,
        }
        
        # Détecter filtres
        if any(word in query_lower for word in ['ouvert', 'ouverte', 'disponible']):
            filters['is_open'] = True
            query = re.sub(r'\b(ouvert|ouverte|disponible)\b', '', query, flags=re.IGNORECASE).strip()
        
        if 'urgence' in query_lower:
            filters['urgence'] = True
            query = query.replace('urgence', '').strip()
        
        if 'garde' in query_lower:
            filters['garde'] = True
            query = query.replace('garde', '').strip()
        
        # Extraire localisation
        main_query, location = UnifiedSearchEngine.extract_location_from_query(query)
        
        return {
            'term': main_query.strip(),
            'location': location,
            'filters': filters,
        }
    
    
    @staticmethod
    def search(
        query: str,
        user_lat: float = None,
        user_lon: float = None,
        limit: int = 20,
        offset: int = 0,
    ) -> dict:
        """
        Recherche principale unifiée (Exigences #1-#17)
        Returns: Résultats triés par pertinence + distance
        """
        if not query or len(query.strip()) < 2:
            return {
                'results': [],
                'total': 0,
                'query': query,
                'detected_intent': None,
                'suggestions': [],
            }
        
        # Parser la requête (Exigence #16)
        parsed = UnifiedSearchEngine.parse_multi_word_query(query)
        main_term = parsed['term']
        location_filter = parsed['location']
        filters = parsed['filters']
        
        # Détecter l'intention (Exigence #9, #12, #17)
        detected_intent = UnifiedSearchEngine.detect_intent(query)
        
        # Expansion avec synonymes (Exigence #15)
        expanded_terms = UnifiedSearchEngine.expand_query_with_synonyms(main_term)
        
        # Normaliser (Exigence #5)
        normalized_query = SearchIndexer.normalize_text(main_term)
        
        # Construire la requête de base
        base_query = SearchIndex.objects.filter(
            is_available=True,
            structure_statut='ACTIVE'
        )
        
        # Filtrer par type détecté (Exigence #12)
        if detected_intent and detected_intent != 'ALL':
            intent_to_type = {
                'medication': ['MEDICAMENT'],
                'symptom': ['MALADIE', 'SERVICE_MEDICAL'],
                'service': ['SERVICE_MEDICAL', 'EXAMEN', 'ANALYSE'],
                'MEDICAMENT': ['MEDICAMENT'],
                'SERVICE_MEDICAL': ['SERVICE_MEDICAL', 'MALADIE'],
                'ANALYSE': ['ANALYSE', 'EXAMEN'],
            }
            types = intent_to_type.get(detected_intent, [])
            if types:
                base_query = base_query.filter(search_type__in=types)
        
        # Recherche textuelle (Exigence #3, #4 - fuzzy, tolérance fautes)
        # Optimisé pour PostgreSQL avec recherche full-text
        search_conditions = Q()
        
        # 1. Correspondance exacte normalisée (poids le plus élevé)
        search_conditions |= Q(content__iexact=normalized_query)
        
        # 2. Contient le terme normalisé (ILIKE pour PostgreSQL)
        search_conditions |= Q(content__icontains=normalized_query)
        
        # 3. Contient le terme original
        search_conditions |= Q(content_original__icontains=main_term)
        
        # 4. Recherche fuzzy - mots individuels pour tolérance aux fautes
        words = normalized_query.split()
        for word in words:
            if len(word) >= 3:  # Mots de min 3 caractères
                search_conditions |= Q(content__icontains=word)
        
        results = base_query.filter(search_conditions)
        
        # Calcul de la distance si coordonnées fournies (Exigence #8)
        # Formule Haversine pour PostgreSQL
        if user_lat and user_lon:
            from math import radians, sin, cos, asin, sqrt
            # Utiliser la formule Haversine directement en SQL pour PostgreSQL
            results = results.extra(
                select={
                    'distance_km': '''
                        6371 * 2 * ASIN(SQRT(
                            POWER(SIN((RADIANS(structure_latitude) - RADIANS(%s)) / 2), 2) +
                            COS(RADIANS(%s)) * COS(RADIANS(structure_latitude)) *
                            POWER(SIN((RADIANS(structure_longitude) - RADIANS(%s)) / 2), 2)
                        ))
                    '''
                },
                select_params=[user_lat, user_lat, user_lon]
            )
        else:
            results = results.extra(
                select={'distance_km': '999999.0'}
            )
        
        # Calcul du score de pertinence (Exigence #7 - classement multicritère)
        # Score basé sur: contenu exact (40%) + contient (30%) + disponibilité (20%) + proximité (10%)
        results_list = list(results)
        
        for item in results_list:
            # Score de pertinence textuelle
            text_score = 0
            if item.content.lower() == normalized_query:
                text_score = 100
            elif normalized_query in item.content.lower():
                text_score = 70
            elif main_term.lower() in item.content_original.lower():
                text_score = 50
            else:
                # Vérifier les mots individuels
                words = normalized_query.split()
                matches = sum(1 for word in words if word in item.content.lower())
                text_score = (matches / len(words)) * 40 if words else 20
            
            # Score de disponibilité
            availability_score = (item.quantity / 10.0) if item.quantity else 20
            availability_score = min(availability_score, 100)
            
            # Score de proximité
            distance = getattr(item, 'distance_km', 999999)
            if distance < 999999:
                proximity_score = max(0, 100 - (distance * 10))  # Perd 10 pts par km
            else:
                proximity_score = 0
            
            # Score final pondéré
            item.relevance_score = (
                text_score * 0.4 +
                availability_score * 0.2 +
                proximity_score * 0.4
            )
        
        # Tri par score
        results_list.sort(key=lambda x: (-x.relevance_score, getattr(x, 'distance_km', 999999)))
        
        # Compter total avant pagination
        total = len(results_list)
        
        # Pagination
        results_paginated = results_list[offset:offset + limit]
        
        # Formater les résultats (Exigence #13 - résultats riches)
        formatted_results = []
        for item in results_paginated:
            distance = getattr(item, 'distance_km', None)
            formatted_results.append({
                'id': str(item.id),
                'content': item.content_original,
                'type': item.search_type,
                'structure': {
                    'id': str(item.structure_id),
                    'nom': item.structure_nom,
                    'type': item.structure_type,
                    'adresse': item.structure_adresse,
                    'telephone': item.structure_telephone,
                    'latitude': float(item.structure_latitude) if item.structure_latitude else None,
                    'longitude': float(item.structure_longitude) if item.structure_longitude else None,
                },
                'distance_km': round(float(distance), 2) if distance and distance < 999999 else None,
                'is_available': item.is_available,
                'quantity': item.quantity,
                'metadata': item.metadata,
                'relevance_score': round(float(item.relevance_score), 2),
            })
        
        # Suggestions si peu de résultats (Exigence #6)
        suggestions = []
        if total < 3:
            suggestions = UnifiedSearchEngine.get_suggestions(query, limit=5)
        
        return {
            'results': formatted_results,
            'total': total,
            'query': query,
            'normalized_query': normalized_query,
            'detected_intent': detected_intent,
            'parsed': parsed,
            'suggestions': suggestions,
            'user_location': {'lat': user_lat, 'lon': user_lon} if user_lat and user_lon else None,
        }
    
    
    @staticmethod
    def get_suggestions(query: str, limit: int = 10) -> list:
        """
        Suggestions intelligentes (Exigence #6)
        Basées sur similarité et popularité
        """
        if not query or len(query) < 2:
            return []
        
        normalized = SearchIndexer.normalize_text(query)
        
        # Recherche optimisée pour PostgreSQL avec ILIKE
        suggestions = SearchIndex.objects.filter(
            Q(content__istartswith=normalized) | Q(content__icontains=normalized),
            is_available=True,
            structure_statut='ACTIVE'
        ).values(
            'content_original', 'search_type'
        ).distinct()[:limit]
        
        return [
            {
                'text': s['content_original'],
                'type': s['search_type'],
            }
            for s in suggestions
        ]


    @staticmethod
    def live_search(query: str, limit: int = 8) -> list:
        """
        Live search pour suggestions instantanées (Exigence #2)
        Optimisé pour vitesse, appelé à chaque frappe
        """
        if not query or len(query) < 2:
            return []
        
        normalized = SearchIndexer.normalize_text(query)
        
        # Recherche rapide avec ILIKE (PostgreSQL)
        results = SearchIndex.objects.filter(
            Q(content__istartswith=normalized) | Q(content__icontains=normalized),
            is_available=True,
            structure_statut='ACTIVE'
        ).values(
            'content_original', 'search_type'
        ).distinct()[:limit]
        
        return [
            {
                'text': r['content_original'],
                'type': r['search_type'],
            }
            for r in results
        ]
