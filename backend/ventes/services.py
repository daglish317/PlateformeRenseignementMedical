from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.utils import IntegrityError
from django.utils import timezone

from notifications.models import TypeNotification
from notifications.service import NotificationService
from stock.models import Medicament, StockItem, StockMovement
from stock.services import StockService
from structures.permissions import (
    get_structure_caissiers,
    get_structure_responsables,
)

from .models import (
    ActionCaisse,
    EtatVente,
    Facture,
    ImpressionFacture,
    LigneVente,
    MotifRetour,
    OperationCaisse,
    Paiement,
    ResultatOperation,
    RetourCaisse,
    RetourCaisseLigne,
    Vente,
)


class VenteErreur(ValueError):
    """Erreur métier liée au module Vente."""


class VenteService:

    # ------------------------------------------------------------------
    # Numérotation
    # ------------------------------------------------------------------

    @staticmethod
    def _generer_numero_vente(structure):
        today = timezone.localdate()
        prefix = f"V{today:%Y%m%d}-"
        for _ in range(10):
            compteur = (
                Vente.objects.filter(
                    structure=structure,
                    numero__startswith=prefix,
                ).count() + 1
            )
            numero = f"{prefix}{compteur:04d}"
            if not Vente.objects.filter(
                structure=structure,
                numero=numero,
            ).exists():
                return numero
        raise VenteErreur("Impossible de générer un numéro de vente.")

    @staticmethod
    def _generer_numero_facture():
        today = timezone.localdate()
        prefix = f"F{today:%Y%m%d}-"
        for _ in range(10):
            compteur = (
                Facture.objects.filter(numero__startswith=prefix).count() + 1
            )
            numero = f"{prefix}{compteur:04d}"
            if not Facture.objects.filter(numero=numero).exists():
                return numero
        raise VenteErreur("Impossible de générer un numéro de facture.")

    @staticmethod
    def _generer_numero_retour(structure):
        today = timezone.localdate()
        prefix = f"R{today:%Y%m%d}-"
        for _ in range(10):
            compteur = (
                RetourCaisse.objects.filter(
                    structure=structure,
                    numero__startswith=prefix,
                ).count() + 1
            )
            numero = f"{prefix}{compteur:04d}"
            if not RetourCaisse.objects.filter(
                structure=structure,
                numero=numero,
            ).exists():
                return numero
        raise VenteErreur("Impossible de générer un numéro de retour.")

    @staticmethod
    def _journal(
        structure,
        utilisateur,
        action,
        detail="",
        adresse_ip=None,
        vente=None,
        resultat=ResultatOperation.SUCCES,
    ):
        """Enregistre une opération dans le journal du module Caisse."""
        return OperationCaisse.objects.create(
            structure=structure,
            vente=vente,
            utilisateur=utilisateur,
            role=utilisateur.role,
            action=action,
            resultat=resultat,
            detail=detail,
            adresse_ip=adresse_ip,
        )

    @staticmethod
    def _adresse_ip(request):
        if request is None:
            return None
        ip = request.META.get("HTTP_X_FORWARDED_FOR")
        if ip:
            return ip.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")

    # ------------------------------------------------------------------
    # Utilitaires stock
    # ------------------------------------------------------------------

    @staticmethod
    def _item_medicament(medicament):
        return (
            StockItem.objects.filter(
                structure=medicament.structure_id,
                nom=medicament.nom,
                type_item=StockItem.TYPE_MEDICAMENT,
            ).first()
        )

    @staticmethod
    def _verifier_medicament(medicament, quantite):
        """Valide qu'un médicament peut être vendu en quantité donnée.

        Le prix de vente provient exclusivement de l'approvisionnement
        (jamais recalculé au moment de la vente).
        """
        if medicament.prix_vente is None or medicament.prix_vente <= 0:
            raise VenteErreur(
                f"Prix de vente invalide pour '{medicament.nom}'."
            )
        item = VenteService._item_medicament(medicament)
        if item is None:
            raise VenteErreur(f"Aucun stock pour '{medicament.nom}'.")
        if item.stock_disponible < quantite:
            raise VenteErreur(
                f"Stock disponible insuffisant pour '{medicament.nom}' "
                f"({item.stock_disponible} disponible(s))."
            )

    @staticmethod
    def _recalculer_totaux(vente):
        lignes = list(LigneVente.objects.filter(vente=vente))
        montant_total = sum(
            (ligne.montant for ligne in lignes),
            Decimal("0"),
        )
        nb_articles = sum(ligne.quantite for ligne in lignes)
        vente.montant_total = montant_total
        vente.nb_articles = nb_articles
        vente.save(update_fields=["montant_total", "nb_articles"])
        return vente

    @staticmethod
    def delai_paiement():
        minutes = getattr(settings, "VENTE_DELAI_PAIEMENT_MINUTES", 15)
        return timedelta(minutes=minutes)

    # ------------------------------------------------------------------
    # Cycle de vie de la vente
    # ------------------------------------------------------------------

    @staticmethod
    def creer_vente(structure, gestionnaire, adresse_ip=None):
        """Crée une nouvelle vente en préparation (numéro automatique)."""
        for _ in range(10):
            numero = VenteService._generer_numero_vente(structure)
            try:
                with transaction.atomic():
                    vente = Vente.objects.create(
                        structure=structure,
                        numero=numero,
                        prepare_par=gestionnaire,
                    )
                    VenteService._journal(
                        structure=structure,
                        utilisateur=gestionnaire,
                        action=ActionCaisse.CREATION,
                        detail=f"Vente {numero} créée.",
                        adresse_ip=adresse_ip,
                        vente=vente,
                    )
                    return vente
            except IntegrityError:
                continue
        raise VenteErreur("Impossible de créer la vente.")

    @staticmethod
    def ajouter_ligne(vente, medicament_id, quantite):
        if vente.etat != EtatVente.EN_PREPARATION:
            raise VenteErreur(
                "La vente a été transmise : les produits ne peuvent plus être modifiés."
            )

        try:
            quantite = int(quantite)
        except (TypeError, ValueError):
            raise VenteErreur("La quantité est invalide.")

        if quantite <= 0:
            raise VenteErreur(
                "La quantité doit être strictement supérieure à zéro."
            )

        try:
            medicament = Medicament.objects.get(id=medicament_id)
        except Medicament.DoesNotExist:
            raise VenteErreur("Médicament introuvable.")

        if medicament.structure_id != vente.structure_id:
            raise VenteErreur(
                "Ce médicament n'appartient pas à la structure de la vente."
            )

        ligne_existante = LigneVente.objects.filter(
            vente=vente,
            medicament=medicament,
        ).first()

        nouveau_total = (ligne_existante.quantite if ligne_existante else 0) + quantite

        VenteService._verifier_medicament(medicament, nouveau_total)

        if ligne_existante:
            ligne_existante.quantite = nouveau_total
            ligne_existante.montant = ligne_existante.prix_unitaire * nouveau_total
            ligne_existante.save(update_fields=["quantite", "montant"])
            ligne = ligne_existante
        else:
            ligne = LigneVente.objects.create(
                vente=vente,
                medicament=medicament,
                designation=medicament.nom,
                forme_pharmaceutique=medicament.forme_pharmaceutique,
                prix_unitaire=medicament.prix_vente,
                quantite=quantite,
                montant=medicament.prix_vente * quantite,
                tva=medicament.tva,
            )

        VenteService._recalculer_totaux(vente)
        return vente, ligne

    @staticmethod
    def modifier_ligne(vente, ligne_id, quantite):
        if vente.etat != EtatVente.EN_PREPARATION:
            raise VenteErreur(
                "La vente a été transmise : les produits ne peuvent plus être modifiés."
            )

        try:
            quantite = int(quantite)
        except (TypeError, ValueError):
            raise VenteErreur("La quantité est invalide.")

        if quantite <= 0:
            raise VenteErreur(
                "La quantité doit être strictement supérieure à zéro."
            )

        try:
            ligne = LigneVente.objects.select_related("medicament").get(
                id=ligne_id,
                vente=vente,
            )
        except LigneVente.DoesNotExist:
            raise VenteErreur("Ligne introuvable.")

        VenteService._verifier_medicament(ligne.medicament, quantite)

        ligne.quantite = quantite
        ligne.montant = ligne.prix_unitaire * quantite
        ligne.save(update_fields=["quantite", "montant"])

        VenteService._recalculer_totaux(vente)
        return vente, ligne

    @staticmethod
    def supprimer_ligne(vente, ligne_id):
        if vente.etat != EtatVente.EN_PREPARATION:
            raise VenteErreur(
                "La vente a été transmise : les produits ne peuvent plus être modifiés."
            )

        try:
            ligne = LigneVente.objects.get(id=ligne_id, vente=vente)
        except LigneVente.DoesNotExist:
            raise VenteErreur("Ligne introuvable.")

        ligne.delete()
        VenteService._recalculer_totaux(vente)
        return vente

    @staticmethod
    @transaction.atomic
    def envoyer_a_la_caisse(vente, adresse_ip=None, nom_client=None):
        """Valide puis réserve les quantités. Le stock physique reste inchangé.

        En cas d'erreur, la transaction est annulée, la vente reste ouverte
        et aucune réservation n'est effectuée.
        """
        if vente.etat != EtatVente.EN_PREPARATION:
            raise VenteErreur("La vente a déjà été transmise.")

        lignes = list(LigneVente.objects.filter(vente=vente).select_related("medicament"))
        if not lignes:
            raise VenteErreur("La vente ne contient aucun médicament.")

        erreurs = []
        for ligne in lignes:
            try:
                item = StockItem.objects.select_for_update().get(
                    structure=vente.structure_id,
                    nom=ligne.designation,
                    type_item=StockItem.TYPE_MEDICAMENT,
                )
            except StockItem.DoesNotExist:
                erreurs.append(
                    f"{ligne.designation}: aucun stock disponible."
                )
                continue

            if ligne.quantite > item.stock_disponible:
                erreurs.append(
                    f"{ligne.designation}: stock disponible insuffisant "
                    f"({item.stock_disponible})."
                )

        if erreurs:
            raise VenteErreur(" ; ".join(erreurs))

        if nom_client is not None:
            vente.nom_client = (nom_client or "").strip()

        for ligne in lignes:
            item = StockItem.objects.select_for_update().get(
                structure=vente.structure_id,
                nom=ligne.designation,
                type_item=StockItem.TYPE_MEDICAMENT,
            )
            item.quantite_reservee += ligne.quantite
            item.save(update_fields=["quantite_reservee"])

        vente.etat = EtatVente.EN_ATTENTE_PAIEMENT
        vente.transmise_le = timezone.now()
        vente.date_expiration = timezone.now() + VenteService.delai_paiement()
        vente.save(update_fields=["etat", "transmise_le", "date_expiration", "nom_client"])

        VenteService._journal(
            structure=vente.structure,
            utilisateur=vente.prepare_par,
            action=ActionCaisse.TRANSMISSION,
            detail=f"Vente {vente.numero} transmise à la caisse "
            f"({vente.montant_total} FCFA).",
            adresse_ip=adresse_ip,
            vente=vente,
        )

        for caissier in get_structure_caissiers(vente.structure):
            NotificationService.envoyer(
                utilisateur=caissier,
                titre="Nouvelle vente à encaisser",
                message=(
                    f"La vente {vente.numero} ({vente.montant_total} FCFA) "
                    f"attend votre encaissement."
                ),
                type=TypeNotification.STRUCTURE,
                structure=vente.structure,
                nav_item="caisse",
            )

        return vente

    @staticmethod
    @transaction.atomic
    def valider_paiement(vente, caissier, mode, adresse_ip=None, nom_client=None):
        """Valide la vente dans une seule transaction logique.

        - marque la vente payée ;
        - diminue le stock physique ;
        - supprime les réservations ;
        - enregistre le paiement ;
        - génère la facture ;
        - journalise les mouvements de stock.
        Si une étape échoue, la transaction est annulée.
        """
        if vente.etat not in (
            EtatVente.EN_ATTENTE_PAIEMENT,
            EtatVente.EN_COURS,
        ):
            raise VenteErreur(
                "Cette vente ne peut pas être encaissée (état invalide)."
            )

        if (
            vente.date_expiration
            and vente.date_expiration < timezone.now()
        ):
            raise VenteErreur(
                "Le délai de paiement de cette vente est dépassé."
            )

        lignes = list(LigneVente.objects.filter(vente=vente).select_related("medicament"))

        if nom_client is not None and not vente.nom_client:
            vente.nom_client = (nom_client or "").strip()

        for ligne in lignes:
            try:
                item = StockItem.objects.select_for_update().get(
                    structure=vente.structure_id,
                    nom=ligne.designation,
                    type_item=StockItem.TYPE_MEDICAMENT,
                )
            except StockItem.DoesNotExist:
                raise VenteErreur(
                    f"Stock introuvable pour '{ligne.designation}'."
                )

            if item.quantite < ligne.quantite or item.quantite_reservee < ligne.quantite:
                raise VenteErreur(
                    f"Stock indisponible pour '{ligne.designation}'."
                )

            item.quantite -= ligne.quantite
            item.quantite_reservee -= ligne.quantite
            if item.quantite == 0:
                item.disponible = False
            item.save(update_fields=["quantite", "quantite_reservee", "disponible"])

            StockMovement.objects.create(
                item=item,
                type_mouvement=StockMovement.TYPE_SORTIE,
                quantite=ligne.quantite,
                motif=f"Vente {vente.numero}",
            )

            # Signalement des ruptures ou des seuils critiques après la vente.
            StockService._verifier_alerte(item)

        paiement = Paiement.objects.create(
            vente=vente,
            mode=mode,
            montant=vente.montant_total,
            encaisse_par=caissier,
        )

        facture = Facture.objects.create(
            numero=VenteService._generer_numero_facture(),
            structure=vente.structure,
            vente=vente,
            paiement=paiement,
            montant_total=vente.montant_total,
            nb_articles=vente.nb_articles,
            beneficiaire=(vente.nom_client or "").strip(),
        )

        vente.etat = EtatVente.PAYEE
        vente.validee_le = timezone.now()
        vente.save(update_fields=["etat", "validee_le", "nom_client"])

        VenteService._journal(
            structure=vente.structure,
            utilisateur=caissier,
            action=ActionCaisse.VALIDATION,
            detail=f"Vente {vente.numero} payée — facture {facture.numero} "
            f"({mode}, {vente.montant_total} FCFA).",
            adresse_ip=adresse_ip,
            vente=vente,
        )

        for responsable in get_structure_responsables(vente.structure):
            NotificationService.envoyer(
                utilisateur=responsable,
                titre="Paiement validé",
                message=(
                    f"La vente {vente.numero} a été payée "
                    f"({vente.montant_total} FCFA) par {caissier.nom}."
                ),
                type=TypeNotification.STRUCTURE,
                structure=vente.structure,
                nav_item="vente",
            )

        return vente, paiement, facture

    @staticmethod
    @transaction.atomic
    def annuler_vente(vente, par=None, motif="", etat_final=None, adresse_ip=None):
        """Annule une vente et libère les quantités réservées.

        Le stock physique n'est jamais modifié.
        """
        if vente.etat not in (
            EtatVente.EN_PREPARATION,
            EtatVente.EN_ATTENTE_PAIEMENT,
            EtatVente.EN_COURS,
        ):
            raise VenteErreur("Cette vente ne peut plus être annulée.")

        if vente.etat in (
            EtatVente.EN_ATTENTE_PAIEMENT,
            EtatVente.EN_COURS,
        ):
            for ligne in LigneVente.objects.filter(vente=vente).select_related("medicament"):
                try:
                    item = StockItem.objects.select_for_update().get(
                        structure=vente.structure_id,
                        nom=ligne.designation,
                        type_item=StockItem.TYPE_MEDICAMENT,
                    )
                except StockItem.DoesNotExist:
                    continue
                libere = min(ligne.quantite, item.quantite_reservee)
                if libere > 0:
                    item.quantite_reservee -= libere
                    item.save(update_fields=["quantite_reservee"])

        etat_final = etat_final or EtatVente.ANNULEE

        if motif:
            vente.motif_annulation = motif
        elif etat_final == EtatVente.EXPIREE:
            vente.motif_annulation = "Expiration du délai de paiement"
        else:
            vente.motif_annulation = "Annulation de la vente"

        vente.etat = etat_final
        vente.annulee_le = timezone.now()
        vente.annulee_par = par
        vente.save(
            update_fields=[
                "etat",
                "annulee_le",
                "annulee_par",
                "motif_annulation",
            ]
        )

        if par is not None:
            VenteService._journal(
                structure=vente.structure,
                utilisateur=par,
                action=ActionCaisse.ANNULATION,
                detail=f"Vente {vente.numero} annulée — {vente.motif_annulation}.",
                adresse_ip=adresse_ip,
                vente=vente,
            )

        for responsable in get_structure_responsables(vente.structure):
            NotificationService.envoyer(
                utilisateur=responsable,
                titre="Vente annulée",
                message=(
                    f"La vente {vente.numero} a été annulée "
                    f"({vente.motif_annulation})."
                ),
                type=TypeNotification.STRUCTURE,
                structure=vente.structure,
                nav_item="vente",
            )

        from alertes.services import AlertesService

        AlertesService.analyser_supervision(vente.structure)

        return vente

    @staticmethod
    def expirer_ventes():
        """Annule et libère les ventes dont le délai de paiement est dépassé."""
        now = timezone.now()
        ventes = Vente.objects.filter(
            etat__in=(
                EtatVente.EN_ATTENTE_PAIEMENT,
                EtatVente.EN_COURS,
            ),
            date_expiration__lt=now,
        )
        count = 0
        for vente in ventes:
            VenteService.annuler_vente(
                vente,
                etat_final=EtatVente.EXPIREE,
            )
            count += 1
        return count

    @staticmethod
    @transaction.atomic
    def ouvrir_vente_caisse(vente, caissier, adresse_ip=None):
        """Le caissier ouvre une vente : elle passe à l'état "En cours".

        L'ouverture est journalisée. Aucune donnée n'est modifiable.
        """
        if vente.etat not in (
            EtatVente.EN_ATTENTE_PAIEMENT,
            EtatVente.EN_COURS,
        ):
            raise VenteErreur("Cette vente ne peut pas être ouverte.")

        if vente.date_expiration and vente.date_expiration < timezone.now():
            raise VenteErreur(
                "Le délai de paiement de cette vente est dépassé."
            )

        if vente.etat == EtatVente.EN_ATTENTE_PAIEMENT:
            vente.etat = EtatVente.EN_COURS
            vente.save(update_fields=["etat"])

        VenteService._journal(
            structure=vente.structure,
            utilisateur=caissier,
            action=ActionCaisse.OUVERTURE,
            detail=f"Vente {vente.numero} ouverte par le caissier.",
            adresse_ip=adresse_ip,
            vente=vente,
        )
        return vente

    # ------------------------------------------------------------------
    # Facturation
    # ------------------------------------------------------------------

    @staticmethod
    def imprimer_facture(facture, utilisateur, adresse_ip=None):
        """Enregistre une impression/réimpression de facture (traçabilité)."""
        premiere = not ImpressionFacture.objects.filter(facture=facture).exists()
        impression = ImpressionFacture.objects.create(
            facture=facture,
            imprime_par=utilisateur,
        )
        VenteService._journal(
            structure=facture.vente.structure,
            utilisateur=utilisateur,
            action=(
                ActionCaisse.IMPRESSION
                if premiere
                else ActionCaisse.REIMPRESSION
            ),
            detail=(
                f"Reçu {facture.numero} "
                + ("imprimé." if premiere else "réimprimé.")
            ),
            adresse_ip=adresse_ip,
            vente=facture.vente,
        )
        return impression

    @staticmethod
    def total_impressions(facture):
        return ImpressionFacture.objects.filter(facture=facture).count()

    @staticmethod
    @transaction.atomic
    def generer_facture(vente, utilisateur, beneficiaire="", adresse_ip=None):
        """Génère une facture à partir d'une vente finalisée, à la demande.

        - La vente doit être payée (finalisée) ;
        - une vente déjà associée à une facture ne produit pas de doublon ;
        - le bénéficiaire est obligatoire : il provient de la vente, ou est
          saisi au moment de la génération ;
        - le stock n'est jamais modifié ici (la facture est un document).
        """
        if vente.etat != EtatVente.PAYEE:
            raise VenteErreur(
                "Une facture ne peut être générée qu'à partir d'une vente finalisée."
            )

        try:
            vente.facture
            raise VenteErreur(
                "Une facture existe déjà pour cette vente : "
                "consultez-la ou imprimez-la."
            )
        except Facture.DoesNotExist:
            pass

        if not vente.paiement:
            raise VenteErreur(
                "Aucun paiement enregistré pour cette vente."
            )

        nom = (beneficiaire or "").strip() or (vente.nom_client or "").strip()
        if not nom:
            raise VenteErreur(
                "Le nom du bénéficiaire est obligatoire pour générer la facture."
            )

        facture = Facture.objects.create(
            numero=VenteService._generer_numero_facture(),
            structure=vente.structure,
            vente=vente,
            paiement=vente.paiement,
            montant_total=vente.montant_total,
            nb_articles=vente.nb_articles,
            beneficiaire=nom,
        )

        VenteService._journal(
            structure=vente.structure,
            utilisateur=utilisateur,
            action=ActionCaisse.GENERATION_FACTURE,
            detail=(
                f"Facture {facture.numero} générée pour la vente "
                f"{vente.numero} ({vente.montant_total} FCFA)."
            ),
            adresse_ip=adresse_ip,
            vente=vente,
        )

        return facture

    @staticmethod
    def statistiques(structure_id):
        """Indicateurs de vente et de retours (réservés au propriétaire)."""
        from django.db.models import Sum

        base = Vente.objects.filter(structure_id=structure_id)
        aujourdhui = timezone.localdate()

        retours = RetourCaisse.objects.filter(structure_id=structure_id)
        retours_aujourdhui = retours.filter(
            effectue_le__date=aujourdhui,
        )

        return {
            "ventes_en_preparation": base.filter(
                etat=EtatVente.EN_PREPARATION
            ).count(),
            "ventes_en_attente": base.filter(
                etat=EtatVente.EN_ATTENTE_PAIEMENT
            ).count(),
            "ventes_en_cours": base.filter(
                etat=EtatVente.EN_COURS
            ).count(),
            "ventes_payees": base.filter(etat=EtatVente.PAYEE).count(),
            "ventes_annulees": base.filter(etat=EtatVente.ANNULEE).count(),
            "ventes_expirees": base.filter(etat=EtatVente.EXPIREE).count(),
            "ventes_aujourdhui": base.filter(
                cree_le__date=aujourdhui
            ).count(),
            "ca_aujourdhui": base.filter(
                etat=EtatVente.PAYEE,
                validee_le__date=aujourdhui,
            ).aggregate(total=Sum("montant_total"))["total"] or 0,
            "ca_total": base.filter(etat=EtatVente.PAYEE).aggregate(
                total=Sum("montant_total")
            )["total"] or 0,
            "retours_total": retours.count(),
            "retours_aujourdhui": retours_aujourdhui.count(),
            "montant_retours": retours.aggregate(
                total=Sum("montant_total")
            )["total"] or 0,
        }

    @staticmethod
    @transaction.atomic
    def effectuer_retour(vente, caissier, motif, items, commentaire="", adresse_ip=None):
        """Ouvre un retour en caisse pour une vente déjà payée.

        - réintègre les produits concernés dans le stock (physique) ;
        - crée l'écriture d'historique ;
        - conserve la facture initiale et relie les deux opérations.
        Toute la transaction est atomique.
        """
        if vente.etat != EtatVente.PAYEE:
            raise VenteErreur(
                "Un retour en caisse ne peut concerner qu'une vente payée."
            )

        try:
            facture = vente.facture
        except Facture.DoesNotExist:
            raise VenteErreur("Aucune facture liée à cette vente.")

        if motif not in MotifRetour.values:
            raise VenteErreur("Le motif du retour est obligatoire.")

        if motif == MotifRetour.AUTRE and not (commentaire or "").strip():
            raise VenteErreur(
                "Le motif « Autre » impose un commentaire."
            )

        if not items:
            raise VenteErreur(
                "Sélectionnez au moins un produit à retourner."
            )

        lignes_vente = {
            ligne.id: ligne
            for ligne in LigneVente.objects.filter(
                vente=vente,
                id__in=[item["ligne_id"] for item in items],
            ).select_related("medicament")
        }

        preparer = []
        for item in items:
            ligne = lignes_vente.get(item.get("ligne_id"))
            if ligne is None:
                raise VenteErreur("Produit introuvable dans la vente.")
            try:
                quantite = int(item.get("quantite"))
            except (TypeError, ValueError):
                raise VenteErreur(
                    f"Quantité invalide pour '{ligne.designation}'."
                )
            if quantite <= 0:
                raise VenteErreur(
                    f"La quantité retournée doit être positive pour "
                    f"'{ligne.designation}'."
                )
            if quantite > ligne.quantite:
                raise VenteErreur(
                    f"La quantité retournée dépasse la quantité vendue "
                    f"pour '{ligne.designation}' ({ligne.quantite})."
                )
            preparer.append((ligne, quantite))

        numero = VenteService._generer_numero_retour(vente.structure)

        retour = RetourCaisse.objects.create(
            structure=vente.structure,
            vente=vente,
            numero=numero,
            motif=motif,
            commentaire=commentaire,
            effectue_par=caissier,
        )

        montant_total = 0
        nb_articles = 0
        for ligne, quantite in preparer:
            try:
                item = StockItem.objects.select_for_update().get(
                    structure=vente.structure_id,
                    nom=ligne.designation,
                    type_item=StockItem.TYPE_MEDICAMENT,
                )
            except StockItem.DoesNotExist:
                item = StockItem.objects.create(
                    structure_id=vente.structure_id,
                    nom=ligne.designation,
                    type_item=StockItem.TYPE_MEDICAMENT,
                    quantite=0,
                )

            item.quantite += quantite
            if item.quantite > 0:
                item.disponible = True
            item.save(update_fields=["quantite", "disponible"])

            from alertes.services import AlertesService

            AlertesService.analyser_item(item)

            StockMovement.objects.create(
                item=item,
                type_mouvement=StockMovement.TYPE_ENTREE,
                quantite=quantite,
                motif=f"Retour en caisse {numero}",
            )

            montant = ligne.prix_unitaire * quantite
            montant_total += montant
            nb_articles += quantite

            RetourCaisseLigne.objects.create(
                retour=retour,
                medicament=ligne.medicament,
                designation=ligne.designation,
                prix_unitaire=ligne.prix_unitaire,
                quantite=quantite,
                montant=montant,
            )

        retour.montant_total = montant_total
        retour.nb_articles = nb_articles
        retour.save(update_fields=["montant_total", "nb_articles"])

        from alertes.services import AlertesService

        AlertesService.analyser_supervision(vente.structure)

        VenteService._journal(
            structure=vente.structure,
            utilisateur=caissier,
            action=ActionCaisse.RETOUR_CAISSE,
            detail=(
                f"Retour {retour.numero} — vente {vente.numero} "
                f"({retour.get_motif_display()}, {montant_total} FCFA)."
            ),
            adresse_ip=adresse_ip,
            vente=vente,
        )

        for responsable in get_structure_responsables(vente.structure):
            NotificationService.envoyer(
                utilisateur=responsable,
                titre="Retour en caisse",
                message=(
                    f"Retour {retour.numero} sur la vente {vente.numero} "
                    f"({retour.get_motif_display()}) par {caissier.nom}."
                ),
                type=TypeNotification.STRUCTURE,
                structure=vente.structure,
                nav_item="caisse",
            )

        from historique.services import HistoriqueService
        from historique.models import TypeEvenementHistorique

        HistoriqueService.enregistrer(
            structure=vente.structure,
            type_evenement=TypeEvenementHistorique.CAISSE_RETOUR,
            utilisateur=caissier,
            donnees={
                "numero_retour": retour.numero,
                "numero_vente": vente.numero,
                "numero_facture": facture.numero,
                "motif": retour.get_motif_display(),
                "commentaire": retour.commentaire,
                "montant": str(retour.montant_total),
                "nb_articles": retour.nb_articles,
                "medicaments": [
                    {"nom": ligne.designation, "quantite": quantite}
                    for ligne, quantite in preparer
                ],
            },
        )

        return retour
