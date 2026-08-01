from django.apps import AppConfig


class SearchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'search'
    
    def ready(self):
        """Importer les signaux pour indexation automatique (Exigence #11, #14)"""
        import search.signals  # noqa
