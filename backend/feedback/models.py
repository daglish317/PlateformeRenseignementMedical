import uuid
from django.db import models


class TypeFeedback(models.TextChoices):
    STRUCTURE = "STRUCTURE", "Structure"
    PLATEFORME = "PLATEFORME", "Plateforme"


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

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]