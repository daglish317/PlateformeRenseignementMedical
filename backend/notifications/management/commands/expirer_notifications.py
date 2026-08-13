from django.core.management.base import BaseCommand

from notifications.service import NotificationService


class Command(BaseCommand):
    help = (
        "Supprime les anciennes notifications lues (défaut : plus de 30 jours)."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--jours",
            type=int,
            default=30,
            help="Âge maximum des notifications conservées (défaut : 30).",
        )

    def handle(self, *args, **options):
        jours = options["jours"]
        deleted, _ = NotificationService.expirer_anciennes(jours=jours)
        self.stdout.write(
            self.style.SUCCESS(
                f"{deleted} notification(s) expirée(s) et supprimée(s)."
            )
        )
