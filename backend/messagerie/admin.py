from django.contrib import admin

from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0

    fields = (
        "expediteur",
        "contenu",
        "is_read",
        "created_at",
    )

    readonly_fields = (
        "expediteur",
        "contenu",
        "created_at",
    )

    ordering = (
        "created_at",
    )


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):

    ordering = (
        "-created_at",
    )

    list_display = (
        "id",
        "structure",
        "created_at",
    )

    search_fields = (
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "created_at",
    )

    list_select_related = (
        "structure",
    )

    inlines = (
        MessageInline,
    )

    fieldsets = (
        (
            "Conversation",
            {
                "fields": (
                    "id",
                    "structure",
                    "created_at",
                )
            },
        ),
    )

    def has_add_permission(self, request):
        return False


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):

    ordering = (
        "-created_at",
    )

    list_display = (
        "conversation",
        "expediteur",
        "is_read",
        "created_at",
    )

    list_filter = (
        "is_read",
        "created_at",
    )

    search_fields = (
        "contenu",
        "expediteur__nom",
        "expediteur__email",
        "conversation__structure__nom",
    )

    readonly_fields = (
        "id",
        "conversation",
        "expediteur",
        "contenu",
        "created_at",
    )

    list_select_related = (
        "conversation",
        "expediteur",
    )

    fieldsets = (
        (
            "Message",
            {
                "fields": (
                    "id",
                    "conversation",
                    "expediteur",
                    "contenu",
                )
            },
        ),
        (
            "État",
            {
                "fields": (
                    "is_read",
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