from django.db import models

import uuid
from django.db import models


class Conversation(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)


class Message(models.Model):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    expediteur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE
    )

    contenu = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
