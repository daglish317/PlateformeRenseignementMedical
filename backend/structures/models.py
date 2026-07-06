import uuid

from django.db import models
from django.utils import timezone


class TypeStructure(models.TextChoices):
    HOPITAL = "HOPITAL", "Hôpital"
    PHARMACIE = "PHARMACIE", "Pharmacie"


class StatutStructure(models.TextChoices):
    EN_ATTENTE = "EN_ATTENTE", "En attente"
    ACTIVE = "ACTIVE", "Active"
    REFUSEE = "REFUSEE", "Refusée"


class Structure(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    nom = models.CharField(
        max_length=255,
        db_index=True,
    )

    type = models.CharField(
        max_length=20,
        choices=TypeStructure.choices,
        db_index=True,
    )

    photo = models.ImageField(
        upload_to="structures/photos/",
        null=True,
        blank=True,
    )

    adresse = models.CharField(
        max_length=255,
    )

    telephone = models.CharField(
        max_length=30,
        db_index=True,
    )

    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
    )

    statut = models.CharField(
        max_length=20,
        choices=StatutStructure.choices,
        default=StatutStructure.EN_ATTENTE,
        db_index=True,
    )

    gestionnaire = models.OneToOneField(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="structure",
    )

    date_creation = models.DateTimeField(
        auto_now_add=True,
    )

    date_validation = models.DateTimeField(
        null=True,
        blank=True,
    )
    motif_refus = models.TextField(
        blank=True,
        default=""
    )

    valide_par = models.ForeignKey(
    "utilisateurs.Utilisateur",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="structures_validees"
    )

    est_supprimee = models.BooleanField(
        default=False,
        db_index=True,
    )

    class Meta:
        verbose_name = "Structure"
        verbose_name_plural = "Structures"
        ordering = ["-date_creation"]
        indexes = [
            models.Index(fields=["latitude", "longitude"]),
        ]

    def valider(self):
        self.statut = StatutStructure.ACTIVE
        self.date_validation = timezone.now()
        self.save(update_fields=["statut", "date_validation"])

    def refuser(self):
        self.statut = StatutStructure.REFUSEE
        self.date_validation = timezone.now()
        self.save(update_fields=["statut", "date_validation"])
    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"