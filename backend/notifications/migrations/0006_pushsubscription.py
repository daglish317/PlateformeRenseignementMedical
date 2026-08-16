# Generated manually to persist the Web Push subscription model.

import uuid

import django.db.models.deletion
from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("notifications", "0005_alter_notification_date_creation"),
    ]

    operations = [
        migrations.CreateModel(
            name="PushSubscription",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("endpoint", models.URLField(max_length=1000, unique=True)),
                ("p256dh", models.CharField(max_length=255)),
                ("auth", models.CharField(max_length=255)),
                ("expiration_time", models.DateTimeField(blank=True, null=True)),
                ("user_agent", models.CharField(blank=True, default="", max_length=512)),
                ("est_active", models.BooleanField(db_index=True, default=True)),
                (
                    "date_creation",
                    models.DateTimeField(db_index=True, default=django.utils.timezone.now),
                ),
                ("date_maj", models.DateTimeField(auto_now=True)),
                (
                    "utilisateur",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="push_subscriptions",
                        to="utilisateurs.utilisateur",
                    ),
                ),
            ],
            options={
                "ordering": ["-date_creation"],
                "indexes": [
                    models.Index(fields=["utilisateur", "est_active"], name="notif_push_user_active_idx"),
                ],
            },
        ),
    ]
