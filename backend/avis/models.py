import uuid

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class AvisStructure(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="avis",
    )

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        related_name="avis",
    )

    note = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["utilisateur", "structure"],
                name="unique_avis_utilisateur_structure",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Avis {self.note}/5 — {self.structure.nom}"


class CommentaireAvis(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    avis = models.ForeignKey(
        AvisStructure,
        on_delete=models.CASCADE,
        related_name="commentaires",
    )

    contenu = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Commentaire sur avis {self.avis_id}"
