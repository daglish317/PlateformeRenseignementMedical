import uuid

from django.db import models


class TypeEvenementHistorique(models.TextChoices):
    """Types d'événements majeurs enregistrés dans le journal.

    Le journal conserve uniquement les événements métier importants.
    De nouveaux types peuvent être ajoutés sans modifier la structure
    du module (extensibilité).
    """

    APPROVISIONNEMENT_CREE = "APPROVISIONNEMENT_CREE", "Approvisionnement enregistré"
    STOCK_SUPPRIME = "STOCK_SUPPRIME", "Stock supprimé"
    INVENTAIRE_GENERE = "INVENTAIRE_GENERE", "Inventaire généré"
    CAISSE_RETOUR = "CAISSE_RETOUR", "Retour caisse"


class EvenementHistorique(models.Model):
    """Trace permanente d'un événement métier important.

    Chaque événement enregistre automatiquement l'identifiant unique, le
    type, la structure concernée, l'utilisateur, son rôle, la date et
    l'heure. Ces informations sont immuables : aucun événement ne peut
    être modifié, supprimé ni renommé.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="evenements_historique",
    )

    type = models.CharField(
        max_length=40,
        choices=TypeEvenementHistorique.choices,
        db_index=True,
    )

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.PROTECT,
        related_name="evenements_historique",
    )

    role = models.CharField(
        max_length=30,
        blank=True,
        default="",
        help_text="Rôle de l'utilisateur au moment de l'action (trace).",
    )

    cree_le = models.DateTimeField(auto_now_add=True, db_index=True)

    donnees = models.JSONField(
        default=dict,
        blank=True,
        help_text="Données contextuelles propres au type d'événement.",
    )

    texte_recherche = models.CharField(
        max_length=2000,
        blank=True,
        default="",
        help_text="Index de recherche en minuscules (type, utilisateur, numéros, produits).",
    )

    class Meta:
        ordering = ["-cree_le"]
        verbose_name = "Événement d'historique"
        verbose_name_plural = "Événements d'historique"

    def __str__(self):
        return f"{self.get_type_display()} - {self.structure.nom}"
