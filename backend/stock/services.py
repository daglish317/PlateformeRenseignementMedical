from django.db import transaction, models
from django.utils import timezone

from .models import (
    Approvisionnement,
    FormePharmaceutique,
    LigneApprovisionnement,
    Medicament,
    StockItem,
    StockMovement,
)
from notifications.service import NotificationService
from notifications.models import TypeNotification
from structures.permissions import get_structure_responsables


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
    @transaction.atomic
    def supprimer_item(*, item):
        item.delete()

    @staticmethod
    def _verifier_alerte(item):
        from alertes.services import AlertesService

        AlertesService.analyser_item(item)

        if item.quantite > item.seuil_alerte:
            return

        responsables = get_structure_responsables(item.structure)
        for utilisateur in responsables:
            NotificationService.envoyer(
                utilisateur=utilisateur,
                titre="Alerte stock faible",
                message=(
                    f"Le stock de '{item.nom}' est bas "
                    f"({item.quantite} restant(s))."
                ),
                type=TypeNotification.STRUCTURE,
                structure=item.structure,
                nav_item="stock",
            )

    @staticmethod
    def items_en_alerte(structure):
        return StockItem.objects.filter(
            structure=structure,
            quantite__gt=0,
            quantite__lt=10,
        )


class ApprovisionnementService:

    @staticmethod
    def _generer_numero(structure):
        from django.utils import timezone

        today = timezone.localdate()
        prefix = f"AP{today:%Y%m%d}-"
        for _ in range(10):
            compteur = (
                Approvisionnement.objects.filter(
                    structure=structure,
                    numero__startswith=prefix,
                ).count() + 1
            )
            numero = f"{prefix}{compteur:04d}"
            if not Approvisionnement.objects.filter(
                structure=structure,
                numero=numero,
            ).exists():
                return numero
        raise ValueError("Impossible de générer un numéro d'approvisionnement.")

    @staticmethod
    def valider_ligne(ligne):
        """Retourne un message d'erreur si la ligne est invalide, sinon ''."""
        nom = (ligne.get("nom") or "").strip()
        if not nom:
            return "Nom du médicament manquant"

        forme = ligne.get("forme_pharmaceutique")
        if forme not in FormePharmaceutique.values:
            return "Forme pharmaceutique invalide"

        quantite = ligne.get("quantite")
        if quantite is None or quantite <= 0:
            return "La quantité doit être strictement supérieure à zéro"

        prix_achat = ligne.get("prix_achat")
        if prix_achat is None or prix_achat < 0:
            return "Le prix d'achat est obligatoire"

        prix_vente = ligne.get("prix_vente")
        if prix_vente is not None and prix_vente < 0:
            return "Le prix de vente est invalide"
        if bool(ligne.get("tva", False)) and prix_vente is not None:
            return "Un produit soumis a la TVA ne peut pas avoir de prix de vente"
        if not bool(ligne.get("tva", False)) and prix_vente is None:
            return "Le prix de vente est obligatoire lorsque la TVA n'est pas appliquee"

        date_peremption = ligne.get("date_peremption")
        if date_peremption is None:
            return "La date de péremption est obligatoire"
        if date_peremption < timezone.localdate():
            return "La date de péremption ne peut pas être antérieure à aujourd'hui"

        return ""

    @staticmethod
    @transaction.atomic
    def enregistrer(
        *,
        structure,
        cree_par,
        date_reception,
        fournisseur="",
        reference_bon="",
        montant_total_declare=0,
        lignes=None,
    ):
        """Enregistre une livraison complète (transactionnel).

        - crée les nouveaux médicaments si nécessaire ;
        - réutilise les médicaments existants ;
        - incrémente le stock et journalise chaque mouvement ;
        - crée l'approvisionnement et ses lignes ;
        - recalcule les alertes de stock.

        Toutes les écritures sont atomiques : si une ligne échoue,
        aucune donnée n'est persistée.
        """
        lignes = lignes or []
        montant_calcule = sum(
            ligne["prix_achat"] * int(ligne["quantite"])
            for ligne in lignes
        )

        if montant_total_declare is None or montant_total_declare <= 0:
            raise ValueError("Le montant total du bon de livraison est obligatoire.")

        if montant_calcule != montant_total_declare:
            raise ValueError(
                "Le montant declare du bon de livraison ne correspond pas "
                "au montant calcule a partir des produits."
            )

        appro = Approvisionnement.objects.create(
            structure=structure,
            numero=ApprovisionnementService._generer_numero(structure),
            cree_par=cree_par,
            date_reception=date_reception,
            fournisseur=(fournisseur or "").strip(),
            reference_bon=(reference_bon or "").strip(),
            montant_total_declare=montant_total_declare,
        )

        motif = f"Approvisionnement — {fournisseur or 'Inconnu'}"
        if reference_bon:
            motif += f" (réf. {reference_bon})"

        for ligne in lignes:
            nom = (ligne["nom"] or "").strip()
            forme = ligne["forme_pharmaceutique"]
            quantite = int(ligne["quantite"])
            prix_achat = ligne["prix_achat"]
            prix_vente = ligne.get("prix_vente")
            date_peremption = ligne["date_peremption"]
            tva = bool(ligne.get("tva", False))
            en_reserve = bool(ligne.get("en_reserve", False))

            if tva and prix_vente is not None:
                raise ValueError(
                    "Un produit soumis a la TVA ne peut pas avoir de prix de vente."
                )
            if tva:
                prix_vente = None

            medicament, created = Medicament.objects.get_or_create(
                structure=structure,
                nom=nom,
                defaults={
                    "forme_pharmaceutique": forme,
                    "prix_vente": prix_vente,
                    "tva": tva,
                    "en_reserve": en_reserve,
                },
            )
            if not created:
                Medicament.objects.filter(pk=medicament.pk).update(
                    forme_pharmaceutique=forme,
                    tva=tva,
                    en_reserve=en_reserve,
                    prix_vente=prix_vente if prix_vente is not None else medicament.prix_vente,
                )
                medicament.refresh_from_db()

            stock_item, _ = StockItem.objects.get_or_create(
                structure=structure,
                nom=nom,
                type_item=StockItem.TYPE_MEDICAMENT,
                defaults={
                    "quantite": 0,
                    "seuil_alerte": 5,
                    "disponible": True,
                },
            )
            stock_avant = stock_item.quantite
            stock_item.quantite += quantite
            stock_item.disponible = True
            stock_item.save(update_fields=["quantite", "disponible"])

            StockMovement.objects.create(
                item=stock_item,
                type_mouvement=StockMovement.TYPE_ENTREE,
                quantite=quantite,
                motif=motif,
                approvisionnement=appro,
            )

            LigneApprovisionnement.objects.create(
                approvisionnement=appro,
                medicament=medicament,
                forme_pharmaceutique=forme,
                stock_avant=stock_avant,
                quantite=quantite,
                prix_achat=prix_achat,
                prix_vente=prix_vente,
                date_peremption=date_peremption,
                tva=tva,
                en_reserve=en_reserve,
            )

            StockService._verifier_alerte(stock_item)

        motif_notif = f"Livraison {appro.date_reception}"
        if appro.fournisseur:
            motif_notif += f" - {appro.fournisseur}"
        if appro.reference_bon:
            motif_notif += f" (réf. {appro.reference_bon})"

        for utilisateur in get_structure_responsables(structure):
            if utilisateur != cree_par:
                NotificationService.envoyer(
                    utilisateur=utilisateur,
                    titre="Approvisionnement enregistré",
                    message=(
                        f"Un approvisionnement a été enregistré par "
                        f"{cree_par.nom}. {motif_notif}."
                    ),
                    type=TypeNotification.STRUCTURE,
                    structure=structure,
                    nav_item="stock",
                )

        from historique.services import HistoriqueService
        from historique.models import TypeEvenementHistorique

        HistoriqueService.enregistrer(
            structure=structure,
            type_evenement=TypeEvenementHistorique.APPROVISIONNEMENT_CREE,
            utilisateur=cree_par,
            donnees={
                "numero": appro.numero,
                "fournisseur": appro.fournisseur,
                "reference_bon": appro.reference_bon,
                "date_reception": f"{appro.date_reception:%d/%m/%Y}",
                "nb_produits": len(lignes),
                "medicaments": [
                    {"nom": ligne["nom"], "quantite": int(ligne["quantite"])}
                    for ligne in lignes
                ],
            },
        )

        return appro
