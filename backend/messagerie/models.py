from django.db import models

import uuid


class Conversation(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="conversations",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        if self.structure:
            return f"Conversation - {self.structure.nom}"
        return f"Conversation #{self.id}"


class Message(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )

    expediteur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="messages_envoyes",
    )

    contenu = models.TextField()

    is_read = models.BooleanField(default=False, db_index=True)

    est_supprime = models.BooleanField(default=False, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["conversation", "is_read"]),
            models.Index(fields=["conversation", "est_supprime", "-created_at"]),
        ]

    def __str__(self):
        return f"Message de {self.expediteur.nom} - {self.contenu[:30]}"
