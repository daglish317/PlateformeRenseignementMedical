import uuid

from django.db import models
from django.utils import timezone


class EtatVente(models.TextChoices):
    EN_PREPARATION = "EN_PREPARATION", "En préparation"
    EN_ATTENTE_PAIEMENT = "EN_ATTENTE_PAIEMENT", "En attente de paiement"
    EN_COURS = "EN_COURS", "En cours"
    PAYEE = "PAYEE", "Payée"
    ANNULEE = "ANNULEE", "Annulée"
    EXPIREE = "EXPIREE", "Expirée"


class ModePaiement(models.TextChoices):
    ESPECES = "ESPECES", "Espèces"
    CARTE = "CARTE", "Carte bancaire"
    MOBILE_MONEY = "MOBILE_MONEY", "Mobile money"
    VIREMENT = "VIREMENT", "Virement"
    CHEQUE = "CHEQUE", "Chèque"


class MotifRetour(models.TextChoices):
    CLIENT_SANS_ARGENT = "CLIENT_SANS_ARGENT", "Client sans argent"
    PRODUIT_RETIRE = "PRODUIT_RETIRE", "Produit retiré"
    ERREUR_QUANTITE = "ERREUR_QUANTITE", "Erreur de quantité"
    ERREUR_PRIX = "ERREUR_PRIX", "Erreur de prix"
    RETOUR_ACCEPTE = "RETOUR_ACCEPTE", "Retour accepté"
    PRODUIT_DEFECTUEUX = "PRODUIT_DEFECTUEUX", "Produit défectueux"
    AUTRE = "AUTRE", "Autre"


class ActionCaisse(models.TextChoices):
    CREATION = "CREATION", "Création de la vente"
    TRANSMISSION = "TRANSMISSION", "Transmission à la caisse"
    OUVERTURE = "OUVERTURE", "Ouverture par le caissier"
    VALIDATION = "VALIDATION", "Validation du paiement"
    ANNULATION = "ANNULATION", "Annulation"
    IMPRESSION = "IMPRESSION", "Impression du reçu"
    REIMPRESSION = "REIMPRESSION", "Réimpression du reçu"
    RETOUR_CAISSE = "RETOUR_CAISSE", "Retour en caisse"


class ResultatOperation(models.TextChoices):
    SUCCES = "SUCCES", "Succès"
    ECHEC = "ECHEC", "Échec"


class Vente(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="ventes",
    )

    numero = models.CharField(max_length=30)

    etat = models.CharField(
        max_length=25,
        choices=EtatVente.choices,
        default=EtatVente.EN_PREPARATION,
        db_index=True,
    )

    prepare_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="ventes_preparees",
    )

    cree_le = models.DateTimeField(auto_now_add=True, db_index=True)
    transmise_le = models.DateTimeField(null=True, blank=True)
    validee_le = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
    )
    annulee_le = models.DateTimeField(null=True, blank=True)
    annulee_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ventes_annulees",
    )

    date_expiration = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Délai de paiement : au-delà, la vente expire automatiquement.",
    )

    nom_client = models.CharField(max_length=255, blank=True, default="")
    telephone_client = models.CharField(max_length=30, blank=True, default="")

    motif_annulation = models.CharField(max_length=255, blank=True, default="")

    montant_total = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0,
    )

    nb_articles = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["structure", "numero"],
                name="unique_vente_structure_numero",
            )
        ]
        indexes = [
            models.Index(fields=["etat", "date_expiration"]),
        ]
        ordering = ["-cree_le"]
        verbose_name = "Vente"
        verbose_name_plural = "Ventes"

    def __str__(self):
        return f"{self.numero} ({self.get_etat_display()})"


class LigneVente(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    vente = models.ForeignKey(
        Vente,
        on_delete=models.CASCADE,
        related_name="lignes",
    )

    medicament = models.ForeignKey(
        "stock.Medicament",
        on_delete=models.PROTECT,
        related_name="lignes_vente",
    )

    designation = models.CharField(max_length=255)
    forme_pharmaceutique = models.CharField(max_length=50)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)
    quantite = models.PositiveIntegerField()
    montant = models.DecimalField(max_digits=14, decimal_places=2)
    tva = models.BooleanField(default=False)

    class Meta:
        ordering = ["id"]
        verbose_name = "Ligne de vente"
        verbose_name_plural = "Lignes de vente"

    def __str__(self):
        return f"{self.designation} x{self.quantite}"


class Paiement(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    vente = models.OneToOneField(
        Vente,
        on_delete=models.CASCADE,
        related_name="paiement",
    )

    mode = models.CharField(max_length=20, choices=ModePaiement.choices)

    montant = models.DecimalField(max_digits=14, decimal_places=2)

    encaisse_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="paiements",
    )

    effectue_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-effectue_le"]
        verbose_name = "Paiement"
        verbose_name_plural = "Paiements"

    def __str__(self):
        return f"{self.mode} - {self.montant}"


class Facture(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    numero = models.CharField(max_length=30, unique=True)

    vente = models.OneToOneField(
        Vente,
        on_delete=models.CASCADE,
        related_name="facture",
    )

    paiement = models.OneToOneField(
        Paiement,
        on_delete=models.CASCADE,
        related_name="facture",
    )

    montant_total = models.DecimalField(max_digits=14, decimal_places=2)
    nb_articles = models.PositiveIntegerField()

    cree_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Facture"
        verbose_name_plural = "Factures"

    def __str__(self):
        return self.numero


class ImpressionFacture(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    facture = models.ForeignKey(
        Facture,
        on_delete=models.CASCADE,
        related_name="impressions",
    )

    imprime_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="impressions_factures",
    )

    imprime_le = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-imprime_le"]
        verbose_name = "Impression de facture"
        verbose_name_plural = "Impressions de factures"

    def __str__(self):
        return f"{self.facture.numero} - {self.imprime_par.nom}"


class RetourCaisse(models.Model):
    """Correction d'une vente déjà payée, liée à la facture d'origine.

    Une facture n'est jamais supprimée : le retour reste toujours lié à la
    vente/facture initiale et réintègre les produits concernés dans le stock.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="retours_caisse",
    )

    vente = models.ForeignKey(
        Vente,
        on_delete=models.PROTECT,
        related_name="retours",
        help_text="Vente (et facture) d'origine du retour.",
    )

    numero = models.CharField(max_length=30)

    motif = models.CharField(max_length=30, choices=MotifRetour.choices)

    commentaire = models.TextField(blank=True, default="")

    effectue_par = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="retours_caisse",
    )

    effectue_le = models.DateTimeField(auto_now_add=True, db_index=True)

    montant_total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    nb_articles = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-effectue_le"]
        verbose_name = "Retour en caisse"
        verbose_name_plural = "Retours en caisse"

    def __str__(self):
        return f"{self.numero} — {self.vente.numero}"


class RetourCaisseLigne(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    retour = models.ForeignKey(
        RetourCaisse,
        on_delete=models.CASCADE,
        related_name="lignes",
    )

    medicament = models.ForeignKey(
        "stock.Medicament",
        on_delete=models.PROTECT,
        related_name="lignes_retour",
    )

    designation = models.CharField(max_length=255)
    prix_unitaire = models.DecimalField(max_digits=12, decimal_places=2)
    quantite = models.PositiveIntegerField()
    montant = models.DecimalField(max_digits=14, decimal_places=2)

    class Meta:
        ordering = ["id"]
        verbose_name = "Ligne de retour en caisse"
        verbose_name_plural = "Lignes de retour en caisse"

    def __str__(self):
        return f"{self.designation} x{self.quantite}"


class OperationCaisse(models.Model):
    """Journal d'audit du module Caisse (traçabilité complète).

    Aucune entrée ne peut être supprimée.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="operations_caisse",
    )

    vente = models.ForeignKey(
        Vente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="operations",
    )

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="operations_caisse",
    )

    role = models.CharField(max_length=30)

    action = models.CharField(max_length=20, choices=ActionCaisse.choices)

    resultat = models.CharField(
        max_length=10,
        choices=ResultatOperation.choices,
        default=ResultatOperation.SUCCES,
    )

    detail = models.TextField(blank=True, default="")

    adresse_ip = models.GenericIPAddressField(null=True, blank=True)

    cree_le = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Opération caisse"
        verbose_name_plural = "Opérations caisse"

    def __str__(self):
        return f"{self.get_action_display()} — {self.utilisateur.nom}"
