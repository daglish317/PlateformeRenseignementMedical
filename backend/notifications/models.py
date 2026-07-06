import uuid
from django.db import models
from django.utils import timezone


class TypeNotification(models.TextChoices):
    SYSTEM = "SYSTEM", "System"
    ADMIN = "ADMIN", "Admin"
    STRUCTURE = "STRUCTURE", "Structure"


class Notification(models.Model):

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    titre = models.CharField(max_length=255)

    message = models.TextField()

    type = models.CharField(
        max_length=20,
        choices=TypeNotification.choices
    )

    est_lue = models.BooleanField(default=False)

    date_creation = models.DateTimeField(default=timezone.now)

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    structure = models.ForeignKey(
        "structures.Structure",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    class Meta:
        ordering = ["-date_creation"]

    def __str__(self):
        return self.titre

    def marquer_comme_lue(self):
        self.est_lue = True
        self.save(update_fields=["est_lue"])