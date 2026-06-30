from django.db import models

import uuid
from django.db import models


class Maladie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    nom = models.CharField(max_length=255, unique=True, db_index=True)

    def __str__(self):
        return self.nom


class PriseEnCharge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="prises_en_charge"
    )

    maladie = models.ForeignKey(
        Maladie,
        on_delete=models.CASCADE,
        related_name="structures"
    )

    niveau = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("structure", "maladie")

    def __str__(self):
        return f"{self.structure.nom} - {self.maladie.nom}"
