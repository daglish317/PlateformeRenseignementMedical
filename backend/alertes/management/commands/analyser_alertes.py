"""Commande d'analyse automatique des alertes.

Le module Alertes analyse en permanence les données des pharmacies.
Cette commande déclenche l'analyse complète de toutes les pharmacies
actives. Elle est destinée à être planifiée (cron) en complément des
déclencheurs intégrés aux modules métier.

Usage :
    python manage.py analyser_alertes
"""

from django.core.management.base import BaseCommand

from structures.models import StatutStructure, Structure, TypeStructure

from ...models import Alerte
from ...services import AlertesService


class Command(BaseCommand):
    help = "Analyse les données des pharmacies et génère les alertes."

    def handle(self, *args, **options):
        structures = Structure.objects.filter(
            type=TypeStructure.PHARMACIE,
            statut=StatutStructure.ACTIVE,
            est_supprimee=False,
        )

        total_alertes = 0
        for structure in structures:
            avant = Alerte.objects.filter(structure=structure).count()
            AlertesService.analyser_structure(structure)
            total_alertes += (
                Alerte.objects.filter(structure=structure).count() - avant
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"{structures.count()} pharmacie(s) analysée(s) "
                f"({total_alertes} alerte(s) traitées)."
            )
        )
