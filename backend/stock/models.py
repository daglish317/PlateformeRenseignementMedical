import uuid

from django.db import models
from django.utils import timezone


class FormePharmaceutique(models.TextChoices):
    COMPRIME = "COMPRIME", "Comprimé"
    CAPSULE = "CAPSULE", "Capsule"
    GELULE = "GELULE", "Gélule"
    SIROP = "SIROP", "Sirop"
    SOLUTION_BUVABLE = "SOLUTION_BUVABLE", "Solution buvable"
    INJECTABLE = "INJECTABLE", "Injectable"
    CREME = "CREME", "Crème"
    POMMADE = "POMMADE", "Pommade"
    GEL = "GEL", "Gel"
    SPRAY = "SPRAY", "Spray"
    COLLYRE = "COLLYRE", "Collyre"
    SACHET = "SACHET", "Sachet"
    AMPOULE = "AMPOULE", "Ampoule"
    SUPPOSITOIRE = "SUPPOSITOIRE", "Suppositoire"
    AUTRE = "AUTRE", "Autre"


class StockItem(models.Model):

    TYPE_MEDICAMENT = "MEDICAMENT"
    TYPE_EQUIPEMENT = "EQUIPEMENT"
    TYPE_CONSOMMABLE = "CONSOMMABLE"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="stock_items",
    )

    nom = models.CharField(max_length=255)

    nom_normalise = models.CharField(
        max_length=255,
        blank=True,
        default="",
        db_index=True,
        help_text="Nom normalisé (sans accents, minuscules) utilisé par la recherche publique.",
    )

    type_item = models.CharField(
        max_length=50,
        choices=[
            (TYPE_MEDICAMENT, "Médicament"),
            (TYPE_EQUIPEMENT, "Équipement"),
            (TYPE_CONSOMMABLE, "Consommable"),
        ],
    )

    quantite = models.PositiveIntegerField(default=0)
    quantite_reservee = models.PositiveIntegerField(
        default=0,
        help_text="Quantité réservée par des ventes en attente de paiement.",
    )
    seuil_alerte = models.PositiveIntegerField(default=5)
    disponible = models.BooleanField(default=True)
    date_ajout = models.DateTimeField(auto_now_add=True)

    @property
    def stock_disponible(self):
        """Stock physique disponible à la vente (physique − réservé)."""
        return max(self.quantite - self.quantite_reservee, 0)

    def save(self, *args, **kwargs):
        from core.utils.text import normaliser_texte

        self.nom_normalise = normaliser_texte(self.nom)
        if kwargs.get("update_fields") is not None:
            kwargs["update_fields"] = set(kwargs["update_fields"]) | {"nom_normalise"}
        super().save(*args, **kwargs)

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

    approvisionnement = models.ForeignKey(
        "Approvisionnement",
        on_delete=models.SET_NULL,
        related_name="mouvements",
        null=True,
        blank=True,
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["item", "-created_at"]),
        ]


class Medicament(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="medicaments",
    )

    nom = models.CharField(max_length=255)

    forme_pharmaceutique = models.CharField(
        max_length=50,
        choices=FormePharmaceutique.choices,
        default=FormePharmaceutique.AUTRE,
    )

    prix_vente = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    tva = models.BooleanField(default=False)

    en_reserve = models.BooleanField(default=False)

    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("structure", "nom")
        ordering = ["nom"]
        verbose_name = "Médicament"
        verbose_name_plural = "Médicaments"

    def __str__(self):
        return f"{self.nom} ({self.get_forme_pharmaceutique_display()})"


class Approvisionnement(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="approvisionnements",
    )

    date_reception = models.DateField(default=timezone.localdate)

    numero = models.CharField(
        max_length=30,
        null=True,
        blank=True,
        help_text="Numéro automatique de l'approvisionnement.",
    )

    fournisseur = models.CharField(max_length=255, blank=True, default="")

    reference_bon = models.CharField(max_length=255, blank=True, default="")

    montant_total_declare = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        help_text="Montant total indique sur le bon de livraison.",
    )

    cree_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="approvisionnements",
    )

    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Approvisionnement"
        verbose_name_plural = "Approvisionnements"
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "numero"],
                condition=models.Q(numero__isnull=False),
                name="unique_approvisionnement_structure_numero",
            )
        ]

    def __str__(self):
        return f"Approvisionnement {self.date_reception} - {self.fournisseur}"


class LigneApprovisionnement(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    approvisionnement = models.ForeignKey(
        Approvisionnement,
        on_delete=models.CASCADE,
        related_name="lignes",
    )

    medicament = models.ForeignKey(
        Medicament,
        on_delete=models.PROTECT,
        related_name="lignes",
    )

    forme_pharmaceutique = models.CharField(
        max_length=50,
        choices=FormePharmaceutique.choices,
    )

    stock_avant = models.PositiveIntegerField(default=0)

    quantite = models.PositiveIntegerField()

    prix_achat = models.DecimalField(max_digits=12, decimal_places=2)

    prix_vente = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    date_peremption = models.DateField()

    tva = models.BooleanField(default=False)

    en_reserve = models.BooleanField(default=False)

    class Meta:
        ordering = ["id"]
        verbose_name = "Ligne d'approvisionnement"
        verbose_name_plural = "Lignes d'approvisionnement"

    def __str__(self):
        return f"{self.medicament.nom} x{self.quantite}"
