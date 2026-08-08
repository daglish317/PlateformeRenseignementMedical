from django.core.management.base import BaseCommand

from ventes.services import VenteService


class Command(BaseCommand):
    help = (
        "Annule les ventes en attente de paiement dont le délai est dépassé "
        "et libère les quantités réservées."
    )

    def handle(self, *args, **options):
        count = VenteService.expirer_ventes()
        self.stdout.write(
            self.style.SUCCESS(
                f"{count} vente(s) expirée(s) et annulée(s)."
            )
        )
