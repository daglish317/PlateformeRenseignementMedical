from django.core.management.base import BaseCommand
from utilisateurs.models import Utilisateur
from notifications.service import NotificationService
from notifications.models import TypeNotification


class Command(BaseCommand):
    help = "Envoie un rappel hebdomadaire aux gestionnaires pour mettre à jour leur structure"

    def handle(self, *args, **options):
        gestionnaires = Utilisateur.objects.filter(
            role="GESTIONNAIRE", is_active=True
        ).select_related()

        count = 0
        for g in gestionnaires:
            NotificationService.envoyer(
                utilisateur=g,
                titre="Rappel mise à jour",
                message="N'oubliez pas de mettre à jour les informations de votre structure cette semaine (horaires, stock, services).",
                type=TypeNotification.SYSTEM,
                nav_item="notifications",
            )
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Rappel envoyé à {count} gestionnaire(s)"))
