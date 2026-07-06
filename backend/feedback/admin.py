from django.contrib import admin

from .models import Feedback


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):

    ordering = (
        "-created_at",
    )

    list_display = (
        "utilisateur",
        "type",
        "structure",
        "note",
        "created_at",
    )

    list_filter = (
        "type",
        "note",
        "created_at",
    )

    search_fields = (
        "utilisateur__nom",
        "utilisateur__email",
        "structure__nom",
        "commentaire",
    )

    readonly_fields = (
        "id",
        "utilisateur",
        "structure",
        "type",
        "note",
        "commentaire",
        "created_at",
    )

    list_select_related = (
        "utilisateur",
        "structure",
    )

    fieldsets = (
        (
            "Feedback",
            {
                "fields": (
                    "id",
                    "utilisateur",
                    "type",
                    "structure",
                    "note",
                    "commentaire",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "created_at",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return False