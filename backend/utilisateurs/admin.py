
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Utilisateur


@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):

    model = Utilisateur

    ordering = ("-date_joined",)

    list_display = (
        "nom",
        "email",
        "role",
        "type_authentification",
        "email_verifie",
        "is_active",
        "is_staff",
        "date_joined",
    )

    list_filter = (
        "role",
        "type_authentification",
        "email_verifie",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "nom",
        "email",
    )

    readonly_fields = (
        "id",
        "date_joined",
        "last_login",
    )

    fieldsets = (
        (
            "Informations générales",
            {
                "fields": (
                    "id",
                    "nom",
                    "email",
                    "password",
                )
            },
        ),
        (
            "Authentification",
            {
                "fields": (
                    "type_authentification",
                    "email_verifie",
                    "last_login",
                )
            },
        ),
        (
            "Rôle",
            {
                "fields": (
                    "role",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Dates",
            {
                "fields": (
                    "date_joined",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "nom",
                    "email",
                    "role",
                    "type_authentification",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )