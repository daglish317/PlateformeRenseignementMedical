from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    ordering = (
        "-date_creation",
    )

    list_display = (
        "titre",
        "utilisateur",
        "type",
        "est_lue",
        "structure",
        "date_creation",
    )

    list_filter = (
        "type",
        "est_lue",
        "date_creation",
    )

    search_fields = (
        "titre",
        "message",
        "utilisateur__nom",
        "utilisateur__email",
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "titre",
        "message",
        "type",
        "utilisateur",
        "structure",
        "date_creation",
    )

    list_editable = (
        "est_lue",
    )

    list_select_related = (
        "utilisateur",
        "structure",
    )

    fieldsets = (
        (
            "Notification",
            {
                "fields": (
                    "id",
                    "titre",
                    "message",
                    "type",
                )
            },
        ),
        (
            "Destinataire",
            {
                "fields": (
                    "utilisateur",
                    "structure",
                )
            },
        ),
        (
            "État",
            {
                "fields": (
                    "est_lue",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "date_creation",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return False