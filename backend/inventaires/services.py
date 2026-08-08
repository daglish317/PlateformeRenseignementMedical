from django.db import transaction
from django.utils import timezone

from stock.models import Medicament, StockItem

from .models import Inventaire, InventaireLigne, StatutInventaire


class InventaireErreur(Exception):
    pass


class InventaireService:
    """Gestion du module Inventaire.

    Le module observe le stock : il ne cree aucun mouvement, ne modifie
    aucune quantite et ne supprime aucun medicament.
    """

    # ------------------------------------------------------------------
    # Numérotation
    # ------------------------------------------------------------------

    @staticmethod
    def _generer_numero(structure):
        today = timezone.localdate()
        prefix = f"INV{today:%Y%m%d}-"
        for _ in range(10):
            compteur = (
                Inventaire.objects.filter(
                    structure=structure,
                    numero__startswith=prefix,
                ).count() + 1
            )
            numero = f"{prefix}{compteur:04d}"
            if not Inventaire.objects.filter(
                structure=structure,
                numero=numero,
            ).exists():
                return numero
        raise InventaireErreur("Impossible de generer un numero d'inventaire.")

    # ------------------------------------------------------------------
    # Statut
    # ------------------------------------------------------------------

    @staticmethod
    def statut_medicament(quantite_disponible, seuil_alerte):
        """Statut d'un medicament a partir de sa quantite disponible.

        - Rupture : quantite disponible egale a zero ;
        - Stock faible : quantite disponible atteint (<=) le seuil d'alerte ;
        - Disponible : quantite disponible strictement superieure au seuil.
        """
        if quantite_disponible == 0:
            return StatutInventaire.RUPTURE
        if quantite_disponible <= seuil_alerte:
            return StatutInventaire.STOCK_FAIBLE
        return StatutInventaire.DISPONIBLE

    # ------------------------------------------------------------------
    # Generation
    # ------------------------------------------------------------------

    @staticmethod
    @transaction.atomic
    def generer(*, structure, utilisateur):
        """Capture l'etat du stock de la structure dans un inventaire.

        Chaque medicament de la structure produit une ligne avec :
        quantite physique, quantite reservee, quantite disponible, seuil
        d'alerte et statut. Les donnees sont des instantanes : un ancien
        inventaire reste identique meme si le stock evolue ensuite.
        """
        numero = InventaireService._generer_numero(structure)

        inventaire = Inventaire.objects.create(
            structure=structure,
            numero=numero,
            cree_par=utilisateur,
            role_createur=utilisateur.role or "",
        )

        items = {
            item.nom: item
            for item in StockItem.objects.filter(
                structure=structure,
                type_item=StockItem.TYPE_MEDICAMENT,
            )
        }

        medicaments = Medicament.objects.filter(
            structure=structure,
        ).order_by("nom")

        lignes = []
        for medicament in medicaments:
            item = items.get(medicament.nom)
            if item is not None:
                quantite_physique = item.quantite
                quantite_reservee = item.quantite_reservee
                seuil_alerte = item.seuil_alerte
                quantite_disponible = max(
                    item.quantite - item.quantite_reservee,
                    0,
                )
            else:
                quantite_physique = 0
                quantite_reservee = 0
                seuil_alerte = 5
                quantite_disponible = 0

            lignes.append(
                InventaireLigne(
                    inventaire=inventaire,
                    medicament=medicament,
                    nom=medicament.nom,
                    forme_pharmaceutique=(
                        medicament.get_forme_pharmaceutique_display()
                    ),
                    quantite_physique=quantite_physique,
                    quantite_reservee=quantite_reservee,
                    quantite_disponible=quantite_disponible,
                    seuil_alerte=seuil_alerte,
                    statut=InventaireService.statut_medicament(
                        quantite_disponible,
                        seuil_alerte,
                    ),
                )
            )

        if lignes:
            InventaireLigne.objects.bulk_create(lignes)

        from alertes.services import AlertesService

        AlertesService.analyser_stock(structure)

        from historique.services import HistoriqueService
        from historique.models import TypeEvenementHistorique

        HistoriqueService.enregistrer(
            structure=structure,
            type_evenement=TypeEvenementHistorique.INVENTAIRE_GENERE,
            utilisateur=utilisateur,
            donnees={
                "numero": inventaire.numero,
                "nb_produits": len(lignes),
                "nb_disponibles": sum(
                    1
                    for ligne in lignes
                    if ligne.statut == StatutInventaire.DISPONIBLE
                ),
                "nb_stock_faible": sum(
                    1
                    for ligne in lignes
                    if ligne.statut == StatutInventaire.STOCK_FAIBLE
                ),
                "nb_ruptures": sum(
                    1
                    for ligne in lignes
                    if ligne.statut == StatutInventaire.RUPTURE
                ),
            },
        )

        return inventaire
