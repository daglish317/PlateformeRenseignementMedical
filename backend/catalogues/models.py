import uuid

from django.core.validators import MinLengthValidator
from django.db import models


class TypeCatalogue(models.TextChoices):
    MALADIE = "MALADIE", "Maladie"
    ANALYSE = "ANALYSE", "Analyse"
    EXAMEN = "EXAMEN", "Examen"
    SERVICE_MEDICAL = "SERVICE_MEDICAL", "Service médical"


class Catalogue(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    nom = models.CharField(
        max_length=255,
        validators=[MinLengthValidator(2)],
        db_index=True,
    )

    type = models.CharField(
        max_length=30,
        choices=TypeCatalogue.choices,
        db_index=True,
    )

    description = models.TextField(
        blank=True,
    )

    est_actif = models.BooleanField(
        default=True,
        db_index=True,
    )

    date_creation = models.DateTimeField(
        auto_now_add=True,
    )

    date_modification = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "Catalogue"
        verbose_name_plural = "Catalogues"

        ordering = [
            "type",
            "nom",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=["nom", "type"],
                name="unique_nom_type_catalogue",
            )
        ]

        indexes = [
            models.Index(fields=["type", "nom"]),
            models.Index(fields=["est_actif"]),
        ]

    def save(self, *args, **kwargs):
        self.nom = self.nom.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"