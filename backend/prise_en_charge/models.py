import uuid
from django.db import models


class PriseEnCharge(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="prises_en_charge"
    )

    service = models.ForeignKey(
        "structures.StructureService",
        on_delete=models.CASCADE,
        related_name="prises_en_charge",
        null=True,
    )

    niveau = models.CharField(
        max_length=20,
        choices=[
            ("COMPLET", "Complet"),
            ("PARTIEL", "Partiel"),
            ("ORIENTATION", "Orientation"),
        ],
        null=True,
        blank=True,
    )

    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "service"],
                name="unique_structure_service_pec"
            )
        ]

    def __str__(self):
        return f"{self.structure.nom} - {self.service.nom}"