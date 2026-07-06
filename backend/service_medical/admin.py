from django.contrib import admin

from .models import ServiceMedical


@admin.register(ServiceMedical)
class ServiceMedicalAdmin(admin.ModelAdmin):

    ordering = (
        "structure__nom",
        "catalogue__nom",
    )

    list_display = (
        "catalogue",
        "structure",
        "actif",
        "date_ajout",
    )

    list_filter = (
        "actif",
        "structure",
    )

    search_fields = (
        "catalogue__nom",
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
        "catalogue",
    )

    fieldsets = (
        (
            "Service médical",
            {
                "fields": (
                    "id",
                    "structure",
                    "catalogue",
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
