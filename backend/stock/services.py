from django.db import transaction, models

from .models import StockItem, StockMovement
from notifications.service import NotificationService
from notifications.models import TypeNotification


class StockService:

    @staticmethod
    @transaction.atomic
    def ajouter_ou_mettre_a_jour(
        *,
        structure,
        nom,
        type_item,
        quantite,
        disponible=True,
        seuil_alerte=5,
    ):

        item, created = StockItem.objects.update_or_create(
            structure=structure,
            nom=nom,
            type_item=type_item,
            defaults={
                "quantite": quantite,
                "disponible": disponible,
                "seuil_alerte": seuil_alerte,
            },
        )

        if created:
            StockMovement.objects.create(
                item=item,
                type_mouvement=StockMovement.TYPE_ENTREE,
                quantite=quantite,
                motif="Création initiale",
            )

        StockService._verifier_alerte(item)
        return item

    @staticmethod
    @transaction.atomic
    def entree_stock(*, item, quantite, motif=""):

        item.quantite += quantite
        item.disponible = True
        item.save()

        StockMovement.objects.create(
            item=item,
            type_mouvement=StockMovement.TYPE_ENTREE,
            quantite=quantite,
            motif=motif,
        )
        StockService._verifier_alerte(item)
        return item

    @staticmethod
    @transaction.atomic
    def retirer_stock(*, item, quantite, motif=""):

        if item.quantite < quantite:
            raise ValueError("Stock insuffisant")

        item.quantite -= quantite
        if item.quantite == 0:
            item.disponible = False
        item.save()

        StockMovement.objects.create(
            item=item,
            type_mouvement=StockMovement.TYPE_SORTIE,
            quantite=quantite,
            motif=motif,
        )
        StockService._verifier_alerte(item)
        return item

    @staticmethod
    def _verifier_alerte(item):
        if item.quantite <= item.seuil_alerte:
            NotificationService.envoyer(
                utilisateur=item.structure.gestionnaire,
                titre="Alerte stock faible",
                message=(
                    f"Le stock de '{item.nom}' est bas "
                    f"({item.quantite} restant(s))."
                ),
                type=TypeNotification.STRUCTURE,
                structure=item.structure,
            )

    @staticmethod
    def items_en_alerte(structure):
        return StockItem.objects.filter(
            structure=structure,
            quantite__lte=models.F("seuil_alerte"),
        )
