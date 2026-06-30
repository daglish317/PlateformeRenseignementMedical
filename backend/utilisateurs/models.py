import uuid
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser

from .managers import UtilisateurManager


class RoleUtilisateur(models.TextChoices):
    ADMINISTRATEUR = "ADMINISTRATEUR", "Administrateur"
    GESTIONNAIRE = "GESTIONNAIRE", "Gestionnaire"
    PATIENT = "PATIENT", "Patient"


class TypeAuthentification(models.TextChoices):
    EMAIL = "EMAIL", "Email"
    GOOGLE = "GOOGLE", "Google"


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    """
    Modèle utilisateur personnalisé.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    nom = models.CharField(
        max_length=150,
    )

    email = models.EmailField(
        max_length=254,
        unique=True,
    )
    
    role = models.CharField(
        max_length=20,
        null=False,
        blank=False,
        choices=RoleUtilisateur.choices,
    )

    type_authentification = models.CharField(
        max_length=10,
        null=False,
        blank=False,
        choices=TypeAuthentification.choices,
    )
    
    email_verifie = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    is_staff = models.BooleanField(
        default=False,
    )

    date_joined = models.DateTimeField(
        default=timezone.now,
    )

    objects = UtilisateurManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["nom"]

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.nom} ({self.email})"