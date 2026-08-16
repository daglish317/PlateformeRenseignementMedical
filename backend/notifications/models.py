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

    nav_item = models.CharField(
        max_length=50,
        blank=True,
        default="",
        db_index=True,
        help_text="Identifiant de l'élément de navigation concerné (ex: structures, profil, messages, notifications)",
    )

    est_lue = models.BooleanField(default=False)

    date_creation = models.DateTimeField(default=timezone.now, db_index=True)

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


class PushSubscription(models.Model):
    """Subscription Web Push d'un appareil utilisateur.

    Le même utilisateur peut posséder plusieurs abonnements actifs, un par
    appareil ou navigateur.
    """

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    utilisateur = models.ForeignKey(
        "utilisateurs.Utilisateur",
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
    )

    endpoint = models.URLField(max_length=1000, unique=True)

    p256dh = models.CharField(max_length=255)

    auth = models.CharField(max_length=255)

    expiration_time = models.DateTimeField(null=True, blank=True)

    user_agent = models.CharField(max_length=512, blank=True, default="")

    est_active = models.BooleanField(default=True, db_index=True)

    date_creation = models.DateTimeField(default=timezone.now, db_index=True)

    date_maj = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_creation"]
        indexes = [
            models.Index(fields=["utilisateur", "est_active"]),
        ]

    def __str__(self):
        return f"{self.utilisateur.email} - {self.endpoint[:48]}"
