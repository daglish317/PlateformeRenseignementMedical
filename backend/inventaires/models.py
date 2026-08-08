import uuid

from django.db import models


class StatutInventaire(models.TextChoices):
    """Statut calcule pour chaque medicament au moment de la generation."""

    DISPONIBLE = "DISPONIBLE", "Disponible"
    STOCK_FAIBLE = "STOCK_FAIBLE", "Stock faible"
    RUPTURE = "RUPTURE", "Rupture"


class Inventaire(models.Model):
    """Photographie du stock d'une structure a un instant donne.

    Un inventaire est immuable : il enregistre l'etat du stock au moment de
    la generation. Il ne modifie, ne cree et ne supprime aucun mouvement.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="inventaires",
    )

    numero = models.CharField(max_length=30)

    cree_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="inventaires",
    )

    role_createur = models.CharField(
        max_length=30,
        blank=True,
        default="",
        help_text="Role de l'utilisateur au moment de la generation (snapshot).",
    )

    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Inventaire"
        verbose_name_plural = "Inventaires"
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "numero"],
                name="unique_inventaire_structure_numero",
            )
        ]

    def __str__(self):
        return f"{self.numero} - {self.structure.nom}"


class InventaireLigne(models.Model):
    """Ligne d'inventaire : etat capture d'un medicament.

    Les champs nom et forme_pharmaceutique sont des instantanes : ils
    preservent l'etat affiche meme si le medicament evolue ensuite.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    inventaire = models.ForeignKey(
        Inventaire,
        on_delete=models.CASCADE,
        related_name="lignes",
    )

    medicament = models.ForeignKey(
        "stock.Medicament",
        on_delete=models.PROTECT,
        related_name="inventaires",
        null=True,
        blank=True,
    )

    nom = models.CharField(max_length=255)

    forme_pharmaceutique = models.CharField(
        max_length=50,
        blank=True,
        default="",
    )

    quantite_physique = models.PositiveIntegerField(default=0)

    quantite_reservee = models.PositiveIntegerField(default=0)

    quantite_disponible = models.PositiveIntegerField(default=0)

    seuil_alerte = models.PositiveIntegerField(default=5)

    statut = models.CharField(
        max_length=20,
        choices=StatutInventaire.choices,
    )

    class Meta:
        ordering = ["nom"]
        verbose_name = "Ligne d'inventaire"
        verbose_name_plural = "Lignes d'inventaire"

    def __str__(self):
        return f"{self.nom} - {self.statut}"
