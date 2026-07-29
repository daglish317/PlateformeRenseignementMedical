import uuid
from django.db import models


class ServiceMedical(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="services_medicaux"
    )

    service = models.ForeignKey(
        "structures.StructureService",
        on_delete=models.CASCADE,
        related_name="services_medicaux",
        null=True,
    )

    actif = models.BooleanField(default=True)

    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("structure", "service")


    def __str__(self):
        return f"{self.structure.nom} - {self.service.nom}"
