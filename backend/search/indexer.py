"""
Système d'indexation automatique en temps réel (Exigences #11, #14)
Met à jour l'index SearchIndex après chaque modification de données
"""
import re
import unicodedata
from django.contrib.postgres.search import SearchVector
from .models import SearchIndex


class SearchIndexer:
    """Indexeur principal pour tout le contenu recherchable"""
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Normalisation stricte du texte (Exigence #5)
        - Suppression des accents
        - Minuscules
        - Suppression caractères spéciaux
        - Suppression espaces multiples
        """
        if not text:
            return ""
        
        # Supprimer les accents
        text = unicodedata.normalize('NFD', text)
        text = ''.join(char for char in text if unicodedata.category(char) != 'Mn')
        
        # Minuscules
        text = text.lower()
        
        # Garder seulement lettres, chiffres, espaces et tirets
        text = re.sub(r'[^a-z0-9\s-]', ' ', text)
        
        # Supprimer espaces multiples
        text = ' '.join(text.split())
        
        return text.strip()
    
    
    @staticmethod
    def index_stock_item(stock_item):
        """
        Indexer un item de stock (Exigence #1 - données réelles)
        Appelé après create/update/delete d'un StockItem
        """
        from stock.models import StockItem
        
        # Supprimer ancien index si existe
        SearchIndex.objects.filter(
            content_type="stock",
            object_id=stock_item.id
        ).delete()
        
        # Ne pas indexer les items supprimés ou indisponibles
        if not stock_item.disponible or stock_item.quantite == 0:
            return
        
        # Déterminer le type de recherche
        search_type_map = {
            "MEDICAMENT": "MEDICAMENT",
            "EQUIPEMENT": "EQUIPEMENT",
            "CONSOMMABLE": "EQUIPEMENT",
        }
        
        content_original = stock_item.nom
        content_normalized = SearchIndexer.normalize_text(content_original)
        
        # Créer l'entrée d'index
        search_index = SearchIndex.objects.create(
            content=content_normalized,
            content_original=content_original,
            search_type=search_type_map.get(stock_item.type_item, "EQUIPEMENT"),
            content_type="stock",
            object_id=stock_item.id,
            structure_id=stock_item.structure.id,
            structure_nom=stock_item.structure.nom,
            structure_type=stock_item.structure.type,
            structure_adresse=stock_item.structure.adresse,
            structure_telephone=stock_item.structure.telephone,
            structure_latitude=stock_item.structure.latitude,
            structure_longitude=stock_item.structure.longitude,
            structure_statut=stock_item.structure.statut,
            is_available=stock_item.disponible and stock_item.quantite > 0,
            quantity=stock_item.quantite,
            metadata={
                "type_item": stock_item.type_item,
                "seuil_alerte": stock_item.seuil_alerte,
            }
        )
    
    
    @staticmethod
    def index_service_medical(service_medical):
        """
        Indexer un service médical (Exigence #1 - données réelles)
        """
        from service_medical.models import ServiceMedical
        
        # Supprimer ancien index
        SearchIndex.objects.filter(
            content_type="service_medical",
            object_id=service_medical.id
        ).delete()
        
        # Ne pas indexer les services inactifs
        if not service_medical.actif or not service_medical.service:
            return
        
        content_original = service_medical.service.nom
        content_normalized = SearchIndexer.normalize_text(content_original)
        
        # Déterminer le type de recherche selon le type de service
        search_type_map = {
            "MALADIE": "MALADIE",
            "ANALYSE": "ANALYSE",
            "EXAMEN": "EXAMEN",
            "SERVICE_MEDICAL": "SERVICE_MEDICAL",
        }
        
        search_index = SearchIndex.objects.create(
            content=content_normalized,
            content_original=content_original,
            search_type=search_type_map.get(service_medical.service.type, "SERVICE_MEDICAL"),
            content_type="service_medical",
            object_id=service_medical.id,
            structure_id=service_medical.structure.id,
            structure_nom=service_medical.structure.nom,
            structure_type=service_medical.structure.type,
            structure_adresse=service_medical.structure.adresse,
            structure_telephone=service_medical.structure.telephone,
            structure_latitude=service_medical.structure.latitude,
            structure_longitude=service_medical.structure.longitude,
            structure_statut=service_medical.structure.statut,
            is_available=service_medical.actif,
            metadata={
                "service_type": service_medical.service.type,
                "service_categorie": service_medical.service.categorie,
                "service_description": service_medical.service.description,
            }
        )
    
    
    @staticmethod
    def index_plateau_technique(plateau):
        """
        Indexer un plateau technique (Exigence #1 - données réelles)
        """
        from plateau_technique.models import PlateauTechnique
        
        SearchIndex.objects.filter(
            content_type="plateau_technique",
            object_id=plateau.id
        ).delete()
        
        if not plateau.disponible or not plateau.service:
            return
        
        content_original = plateau.service.nom
        content_normalized = SearchIndexer.normalize_text(content_original)
        
        search_index = SearchIndex.objects.create(
            content=content_normalized,
            content_original=content_original,
            search_type="PLATEAU_TECHNIQUE",
            content_type="plateau_technique",
            object_id=plateau.id,
            structure_id=plateau.structure.id,
            structure_nom=plateau.structure.nom,
            structure_type=plateau.structure.type,
            structure_adresse=plateau.structure.adresse,
            structure_telephone=plateau.structure.telephone,
            structure_latitude=plateau.structure.latitude,
            structure_longitude=plateau.structure.longitude,
            structure_statut=plateau.structure.statut,
            is_available=plateau.disponible,
            metadata={
                "service_type": plateau.service.type,
                "service_categorie": plateau.service.categorie,
            }
        )
    
    
    @staticmethod
    def reindex_all():
        """
        Réindexer toutes les données (Exigence #14 - sync auto)
        Utile après import Excel ou maintenance
        """
        from stock.models import StockItem
        from service_medical.models import ServiceMedical
        from plateau_technique.models import PlateauTechnique
        
        # Supprimer tout l'index
        SearchIndex.objects.all().delete()
        
        # Réindexer stocks
        for item in StockItem.objects.select_related('structure').all():
            try:
                SearchIndexer.index_stock_item(item)
            except Exception as e:
                print(f"Erreur indexation stock {item.id}: {e}")
        
        # Réindexer services médicaux
        for service in ServiceMedical.objects.select_related('structure', 'service').all():
            try:
                SearchIndexer.index_service_medical(service)
            except Exception as e:
                print(f"Erreur indexation service {service.id}: {e}")
        
        # Réindexer plateaux techniques
        for plateau in PlateauTechnique.objects.select_related('structure', 'service').all():
            try:
                SearchIndexer.index_plateau_technique(plateau)
            except Exception as e:
                print(f"Erreur indexation plateau {plateau.id}: {e}")
        
        print(f"✅ Réindexation terminée: {SearchIndex.objects.count()} entrées")
    
    
    @staticmethod
    def delete_structure_indexes(structure_id):
        """
        Supprimer tous les index liés à une structure
        Appelé quand une structure est supprimée ou désactivée
        """
        SearchIndex.objects.filter(structure_id=structure_id).delete()
