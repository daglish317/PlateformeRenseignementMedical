"""
Signaux Django pour indexation automatique en temps reel (Exigence #11, #14)
Trigger automatique apres create/update/delete
"""
from django.db.models.signals import post_save, post_delete, pre_delete
from django.dispatch import receiver

from core.cache import invalidate_cache_pattern
from .indexer import SearchIndexer


def _invalidate_public_search_cache():
    invalidate_cache_pattern("search:*")
    invalidate_cache_pattern("live_search:*")
    invalidate_cache_pattern("suggestions:*")


@receiver(post_save, sender="stock.StockItem")
def index_stock_on_save(sender, instance, created, **kwargs):
    try:
        SearchIndexer.index_stock_item(instance)
        _invalidate_public_search_cache()
    except Exception as e:
        print(f"Erreur indexation stock {instance.id}: {e}")


@receiver(post_delete, sender="stock.StockItem")
def delete_stock_index(sender, instance, **kwargs):
    from .models import SearchIndex

    SearchIndex.objects.filter(
        content_type="stock",
        object_id=instance.id,
    ).delete()
    _invalidate_public_search_cache()


@receiver(post_save, sender="service_medical.ServiceMedical")
def index_service_on_save(sender, instance, created, **kwargs):
    try:
        SearchIndexer.index_service_medical(instance)
        _invalidate_public_search_cache()
    except Exception as e:
        print(f"Erreur indexation service {instance.id}: {e}")


@receiver(post_delete, sender="service_medical.ServiceMedical")
def delete_service_index(sender, instance, **kwargs):
    from .models import SearchIndex

    SearchIndex.objects.filter(
        content_type="service_medical",
        object_id=instance.id,
    ).delete()
    _invalidate_public_search_cache()


@receiver(post_save, sender="plateau_technique.PlateauTechnique")
def index_plateau_on_save(sender, instance, created, **kwargs):
    try:
        SearchIndexer.index_plateau_technique(instance)
        _invalidate_public_search_cache()
    except Exception as e:
        print(f"Erreur indexation plateau {instance.id}: {e}")


@receiver(post_delete, sender="plateau_technique.PlateauTechnique")
def delete_plateau_index(sender, instance, **kwargs):
    from .models import SearchIndex

    SearchIndex.objects.filter(
        content_type="plateau_technique",
        object_id=instance.id,
    ).delete()
    _invalidate_public_search_cache()


@receiver(pre_delete, sender="structures.Structure")
def delete_structure_indexes(sender, instance, **kwargs):
    SearchIndexer.delete_structure_indexes(instance.id)
    _invalidate_public_search_cache()


@receiver(post_save, sender="structures.Structure")
def update_structure_in_indexes(sender, instance, created, **kwargs):
    if not created:
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
        _invalidate_public_search_cache()
