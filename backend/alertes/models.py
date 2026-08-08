"""Modèles du module Alertes.

Le module Alertes est un système de surveillance : aucune alerte n'est
créée, modifiée ou supprimée par un utilisateur. Toutes les alertes sont
générées automatiquement par le système selon des règles métier et sont
immuables (lecture seule).
"""

import uuid

from django.db import models


class CategorieAlerte(models.TextChoices):
    """Les deux catégories d'alertes du système.

    - Opérationnelle : fonctionnement quotidien, visible par le
      gestionnaire et le propriétaire ;
    - Supervision : pilotage de la pharmacie, visible uniquement par le
      propriétaire.
    """

    OPERATIONNELLE = "OPERATIONNELLE", "Opérationnelle"
    SUPERVISION = "SUPERVISION", "Supervision"


class PrioriteAlerte(models.TextChoices):
    """Priorité automatique attribuée à chaque alerte."""

    CRITIQUE = "CRITIQUE", "Critique"
    MOYENNE = "MOYENNE", "Moyenne"
    INFORMATION = "INFORMATION", "Information"


class TypeAlerte(models.TextChoices):
    """Types d'alertes générés par les règles métier."""

    STOCK_FAIBLE = "STOCK_FAIBLE", "Stock faible"
    RUPTURE_STOCK = "RUPTURE_STOCK", "Rupture de stock"
    RETOURS_CAISSE_ANORMAUX = (
        "RETOURS_CAISSE_ANORMAUX",
        "Retours caisse inhabituels",
    )
    VENTES_ANNULEES_ANORMALES = (
        "VENTES_ANNULEES_ANORMALES",
        "Annulations de vente inhabituelles",
    )


class ModuleAlerte(models.TextChoices):
    """Module concerné vers lequel l'utilisateur est orienté."""

    APPROVISIONNEMENT = "APPROVISIONNEMENT", "Approvisionnement"
    STOCK = "STOCK", "Stock"
    VENTE = "VENTE", "Vente"
    CAISSE = "CAISSE", "Caisse"
    INVENTAIRE = "INVENTAIRE", "Inventaire"


class Alerte(models.Model):
    """Alerte générée automatiquement par le système.

    Chaque alerte est liée à une structure et porte une catégorie, un
    type, une priorité et le module concerné par la situation. L'état de
    lecture est propre à chaque utilisateur (`lu_par`). Une alerte peut
    être résolue automatiquement lorsque la situation revient à la
    normale ; elle n'est jamais modifiable ni supprimable.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="alertes",
    )

    categorie = models.CharField(
        max_length=20,
        choices=CategorieAlerte.choices,
        db_index=True,
    )

    type = models.CharField(
        max_length=40,
        choices=TypeAlerte.choices,
        db_index=True,
    )

    priorite = models.CharField(
        max_length=15,
        choices=PrioriteAlerte.choices,
        db_index=True,
    )

    module = models.CharField(
        max_length=30,
        choices=ModuleAlerte.choices,
    )

    titre = models.CharField(max_length=255)

    description = models.TextField()

    utilisateur_concerne = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="alertes_concernees",
        help_text=(
            "Utilisateur directement impliqué dans la situation détectée "
            "(ex. caissier à l'origine des retours caisse)."
        ),
    )

    donnees = models.JSONField(
        default=dict,
        blank=True,
        help_text="Données contextuelles propres au type d'alerte.",
    )

    est_resolue = models.BooleanField(
        default=False,
        db_index=True,
        help_text=(
            "True lorsque le système détecte que la situation est revenue "
            "à la normale (résolution automatique)."
        ),
    )

    cree_le = models.DateTimeField(auto_now_add=True, db_index=True)

    lu_par = models.ManyToManyField(
        "utilisateurs.Utilisateur",
        blank=True,
        related_name="alertes_lues",
        help_text=(
            "Utilisateurs ayant marqué cette alerte comme lue. L'état de "
            "lecture est propre à chaque utilisateur."
        ),
    )

    texte_recherche = models.CharField(
        max_length=2000,
        blank=True,
        default="",
        help_text=(
            "Index de recherche en minuscules (titre, type, catégorie, "
            "module, médicament, utilisateur concerné)."
        ),
    )

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Alerte"
        verbose_name_plural = "Alertes"
        indexes = [
            models.Index(fields=["structure", "est_resolue"]),
        ]

    def __str__(self):
        return f"{self.titre} - {self.structure.nom}"

    def est_lue_par(self, utilisateur):
        if utilisateur is None or not utilisateur.is_authenticated:
            return False
        return self.lu_par.filter(pk=utilisateur.pk).exists()
