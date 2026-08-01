"""
Signaux Django pour indexation automatique en temps réel (Exigence #11, #14)
Trigger automatique après create/update/delete
"""
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver
from .indexer import SearchIndexer


# ==================== SIGNALS STOCK ====================

@receiver(post_save, sender='stock.StockItem')
def index_stock_on_save(sender, instance, created, **kwargs):
    """Indexer automatiquement après création/modification de stock"""
    try:
        SearchIndexer.index_stock_item(instance)
    except Exception as e:
        print(f"Erreur indexation stock {instance.id}: {e}")


@receiver(post_delete, sender='stock.StockItem')
def delete_stock_index(sender, instance, **kwargs):
    """Supprimer l'index après suppression de stock"""
    from .models import SearchIndex
    SearchIndex.objects.filter(
        content_type="stock",
        object_id=instance.id
    ).delete()


# ==================== SIGNALS SERVICE MEDICAL ====================

@receiver(post_save, sender='service_medical.ServiceMedical')
def index_service_on_save(sender, instance, created, **kwargs):
    """Indexer automatiquement après création/modification de service"""
    try:
        SearchIndexer.index_service_medical(instance)
    except Exception as e:
        print(f"Erreur indexation service {instance.id}: {e}")


@receiver(post_delete, sender='service_medical.ServiceMedical')
def delete_service_index(sender, instance, **kwargs):
    """Supprimer l'index après suppression de service"""
    from .models import SearchIndex
    SearchIndex.objects.filter(
        content_type="service_medical",
        object_id=instance.id
    ).delete()


# ==================== SIGNALS PLATEAU TECHNIQUE ====================

@receiver(post_save, sender='plateau_technique.PlateauTechnique')
def index_plateau_on_save(sender, instance, created, **kwargs):
    """Indexer automatiquement après création/modification de plateau"""
    try:
        SearchIndexer.index_plateau_technique(instance)
    except Exception as e:
        print(f"Erreur indexation plateau {instance.id}: {e}")


@receiver(post_delete, sender='plateau_technique.PlateauTechnique')
def delete_plateau_index(sender, instance, **kwargs):
    """Supprimer l'index après suppression de plateau"""
    from .models import SearchIndex
    SearchIndex.objects.filter(
        content_type="plateau_technique",
        object_id=instance.id
    ).delete()


# ==================== SIGNALS STRUCTURE ====================

@receiver(pre_delete, sender='structures.Structure')
def delete_structure_indexes(sender, instance, **kwargs):
    """
    Supprimer tous les index liés à une structure
    avant suppression de la structure
    """
    SearchIndexer.delete_structure_indexes(instance.id)


@receiver(post_save, sender='structures.Structure')
def update_structure_in_indexes(sender, instance, created, **kwargs):
    """
    Mettre à jour les infos de structure dans tous ses index
    quand la structure est modifiée (nom, adresse, statut, etc.)
    """
    if not created:  # Seulement sur update, pas sur create
        from .models import SearchIndex
        SearchIndex.objects.filter(structure_id=instance.id).update(
            structure_nom=instance.nom,
            structure_type=instance.type,
            structure_adresse=instance.adresse,
            structure_telephone=instance.telephone,
            structure_latitude=instance.latitude,
            structure_longitude=instance.longitude,
            structure_statut=instance.statut,
        )
