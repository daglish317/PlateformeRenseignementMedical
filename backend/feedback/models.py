import uuid
from django.db import models


class TypeFeedback(models.TextChoices):
    STRUCTURE = "STRUCTURE", "Structure"
    PLATEFORME = "PLATEFORME", "Plateforme"


class CategorieFeedback(models.TextChoices):
    BUG = "BUG", "Bug"
    SUGGESTION = "SUGGESTION", "Suggestion"
    SIGNALEMENT = "SIGNALEMENT", "Signalement"
    AUTRE = "AUTRE", "Autre"


class StatutFeedback(models.TextChoices):
    NON_LU = "NON_LU", "Non lu"
    LU = "LU", "Lu"
    TRAITE = "TRAITE", "Traité"


class Feedback(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="feedbacks"
    )

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="feedbacks"
    )

    type = models.CharField(
        max_length=20,
        choices=TypeFeedback.choices
    )

    note = models.PositiveSmallIntegerField()

    commentaire = models.TextField(blank=True, null=True)

    sujet = models.CharField(max_length=255, blank=True, default="")

    categorie = models.CharField(
        max_length=20,
        choices=CategorieFeedback.choices,
        default=CategorieFeedback.AUTRE,
    )

    statut = models.CharField(
        max_length=20,
        choices=StatutFeedback.choices,
        default=StatutFeedback.NON_LU,
        db_index=True,
    )

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]