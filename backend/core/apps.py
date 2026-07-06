from django.apps import AppConfig


class CoreConfig(AppConfig):

    default_auto_field = "django.db.models.BigAutoField"

    name = "core"

    def ready(self):

        from core.events.init import register_all_events

        register_all_events()