from django.contrib import admin

from .models import ServiceMedical


@admin.register(ServiceMedical)
class ServiceMedicalAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "service__nom",
    )

    list_display = (
        "service",
        "structure",
        "actif",
        "date_ajout",
    )

    list_filter = (
        "actif",
        "structure",
    )

    search_fields = (
        "service__nom",
        "structure__nom",
    )

    readonly_fields = (
        "id",
        "date_ajout",
    )

    list_editable = (
        "actif",
    )

    list_select_related = (
        "structure",
        "service",
    )

    fieldsets = (
        (
            "Service médical",
            {
                "fields": (
                    "id",
                    "structure",
                    "service",
                )
            },
        ),
        (
            "État",
            {
                "fields": (
                    "actif",
                )
            },
        ),
        (
            "Historique",
            {
                "fields": (
                    "date_ajout",
                )
            },
        ),
    )
