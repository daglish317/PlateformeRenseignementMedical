import uuid

from django.db import models


class StockItem(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="stock_items",
    )

    nom = models.CharField(max_length=255)

    type_item = models.CharField(
        max_length=50,
        choices=[
            ("MEDICAMENT", "Médicament"),
            ("EQUIPEMENT", "Équipement"),
            ("CONSOMMABLE", "Consommable"),
        ],
    )

    quantite = models.PositiveIntegerField(default=0)
    seuil_alerte = models.PositiveIntegerField(default=5)
    disponible = models.BooleanField(default=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("structure", "nom", "type_item")
        ordering = ["nom"]

    def __str__(self):
        return f"{self.structure.nom} - {self.nom}"


class StockMovement(models.Model):

    TYPE_ENTREE = "ENTREE"
    TYPE_SORTIE = "SORTIE"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    item = models.ForeignKey(
        StockItem,
        on_delete=models.CASCADE,
        related_name="mouvements",
    )

    type_mouvement = models.CharField(
        max_length=10,
        choices=[(TYPE_ENTREE, "Entrée"), (TYPE_SORTIE, "Sortie")],
    )

    quantite = models.PositiveIntegerField()
    motif = models.CharField(max_length=255, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
