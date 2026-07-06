from django.db import models

import uuid
from django.db import models


class ServiceMedical(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="services_medicaux"
    )

    catalogue = models.ForeignKey(
        "catalogues.Catalogue",
        on_delete=models.CASCADE,
        related_name="services_medicaux",
    )

    actif = models.BooleanField(default=True)

    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("structure", "catalogue")

    def __str__(self):
        return f"{self.structure.nom} - {self.catalogue.nom}"
