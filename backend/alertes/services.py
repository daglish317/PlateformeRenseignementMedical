"""Règles métier de génération automatique des alertes.

Le module Alertes est un système de surveillance : il n'écrit aucune
donnée métier. Il analyse en permanence les données des modules
Approvisionnement, Stock, Vente, Caisse et Inventaire, puis génère les
alertes selon des règles prédéfinies.

Règles implémentées :

- Stock faible  (opérationnelle, moyenne) : le stock disponible devient
  inférieur ou égal au seuil d'alerte.
- Rupture de stock (opérationnelle, critique) : le stock disponible
  atteint zéro.
- Retours caisse inhabituels (supervision, moyenne) : le nombre de
  retours caisse du jour dépasse anormalement la moyenne habituelle.
- Annulations de vente inhabituelles (supervision, information) : le
  nombre de ventes annulées avant validation dépasse anormalement la
  moyenne habituelle.

Une alerte est résolue automatiquement lorsque la situation revient à la
normale. Aucune alerte n'est jamais créée, modifiée ou supprimée par un
utilisateur.
"""

from datetime import timedelta

from django.conf import settings
from django.db.models import Count
from django.utils import timezone

from .models import (
    Alerte,
    CategorieAlerte,
    ModuleAlerte,
    PrioriteAlerte,
    TypeAlerte,
)


# Seuils configurables via les réglages Django.
SEUIL_RETOURS_MINIMUM = getattr(settings, "ALERTE_RETOURS_MINIMUM", 5)
SEUIL_RETOURS_MULTIPLICATEUR = getattr(
    settings, "ALERTE_RETOURS_MULTIPLICATEUR", 3
)
SEUIL_ANNULATIONS_MINIMUM = getattr(
    settings, "ALERTE_ANNULATIONS_MINIMUM", 3
)
SEUIL_ANNULATIONS_MULTIPLICATEUR = getattr(
    settings, "ALERTE_ANNULATIONS_MULTIPLICATEUR", 3
)
FENETRE_MOYENNE_JOURS = getattr(settings, "ALERTE_MOYENNE_JOURS", 30)


class AlertesService:
    """Génère et résout automatiquement les alertes (système passif)."""

    # ------------------------------------------------------------------
    # Cartographie des règles
    # ------------------------------------------------------------------

    @staticmethod
    def _config_alerte(type_alerte):
        """Catégorie, priorité et module d'un type d'alerte."""
        return {
            TypeAlerte.STOCK_FAIBLE: (
                CategorieAlerte.OPERATIONNELLE,
                PrioriteAlerte.MOYENNE,
                ModuleAlerte.APPROVISIONNEMENT,
            ),
            TypeAlerte.RUPTURE_STOCK: (
                CategorieAlerte.OPERATIONNELLE,
                PrioriteAlerte.CRITIQUE,
                ModuleAlerte.APPROVISIONNEMENT,
            ),
            TypeAlerte.RETOURS_CAISSE_ANORMAUX: (
                CategorieAlerte.SUPERVISION,
                PrioriteAlerte.MOYENNE,
                ModuleAlerte.CAISSE,
            ),
            TypeAlerte.VENTES_ANNULEES_ANORMALES: (
                CategorieAlerte.SUPERVISION,
                PrioriteAlerte.INFORMATION,
                ModuleAlerte.VENTE,
            ),
        }[type_alerte]

    @staticmethod
    def _texte_recherche(alerte, donnees, utilisateur_concerne):
        """Construit l'index de recherche en minuscules.

        Couvre les critères de la spécification : médicament, type
        d'alerte et utilisateur concerné.
        """
        morceaux = [
            alerte.titre,
            alerte.description,
            alerte.type,
            TypeAlerte(alerte.type).label,
            alerte.categorie,
            CategorieAlerte(alerte.categorie).label,
            alerte.module,
            ModuleAlerte(alerte.module).label,
            donnees.get("medicament_nom"),
        ]
        if utilisateur_concerne:
            morceaux.append(utilisateur_concerne.nom)
        return " ".join(
            str(morceau) for morceau in morceaux if morceau
        ).lower()

    # ------------------------------------------------------------------
    # Création / résolution
    # ------------------------------------------------------------------

    @staticmethod
    def _creer(
        *,
        structure,
        type_alerte,
        donnees,
        titre,
        description,
        utilisateur_concerne=None,
    ):
        categorie, priorite, module = AlertesService._config_alerte(type_alerte)
        alerte = Alerte.objects.create(
            structure=structure,
            categorie=categorie,
            type=type_alerte,
            priorite=priorite,
            module=module,
            titre=titre,
            description=description,
            utilisateur_concerne=utilisateur_concerne,
            donnees=donnees or {},
        )
        alerte.texte_recherche = AlertesService._texte_recherche(
            alerte,
            donnees,
            utilisateur_concerne,
        )
        alerte.save(update_fields=["texte_recherche"])
        AlertesService._notifier_responsables(alerte)
        return alerte

    @staticmethod
    def _notifier_responsables(alerte):
        """Alimente le compteur de navigation sans modifier l'alerte metier."""
        from notifications.service import NotificationService
        from structures.permissions import get_structure_responsables

        push_enabled = alerte.type in {
            TypeAlerte.STOCK_FAIBLE,
            TypeAlerte.RUPTURE_STOCK,
        }

        for utilisateur in get_structure_responsables(alerte.structure):
            NotificationService.envoyer(
                utilisateur=utilisateur,
                titre=alerte.titre,
                message=alerte.description,
                type="STRUCTURE",
                structure=alerte.structure,
                nav_item="alertes",
                push=push_enabled,
            )

    @staticmethod
    def _resoudre(*, structure, type_alerte, medicament_nom=None):
        """Marque comme résolues les alertes actives du type donné."""
        queryset = Alerte.objects.filter(
            structure=structure,
            type=type_alerte,
            est_resolue=False,
        )
        if medicament_nom is not None:
            queryset = queryset.filter(donnees__medicament_nom=medicament_nom)
        return queryset.update(est_resolue=True)

    @staticmethod
    def _alerte_active(*, structure, type_alerte, medicament_nom=None):
        queryset = Alerte.objects.filter(
            structure=structure,
            type=type_alerte,
            est_resolue=False,
        )
        if medicament_nom is not None:
            queryset = queryset.filter(donnees__medicament_nom=medicament_nom)
        return queryset.exists()

    # ------------------------------------------------------------------
    # Analyse du stock (alertes opérationnelles)
    # ------------------------------------------------------------------

    @staticmethod
    def analyser_item(item):
        """Analyse un article de stock et met à jour ses alertes.

        Le stock disponible est le stock physique moins les quantités
        réservées. Une rupture de stock prend le pas sur un stock faible
        déjà signalé.
        """
        from stock.models import StockItem

        if item.type_item != StockItem.TYPE_MEDICAMENT:
            return

        stock_disponible = item.stock_disponible
        seuil = item.seuil_alerte

        if stock_disponible == 0:
            type_cible = TypeAlerte.RUPTURE_STOCK
        elif stock_disponible <= seuil:
            type_cible = TypeAlerte.STOCK_FAIBLE
        else:
            type_cible = None

        if type_cible is None:
            AlertesService._resoudre(
                structure=item.structure,
                type_alerte=TypeAlerte.STOCK_FAIBLE,
                medicament_nom=item.nom,
            )
            AlertesService._resoudre(
                structure=item.structure,
                type_alerte=TypeAlerte.RUPTURE_STOCK,
                medicament_nom=item.nom,
            )
            return

        autre_type = (
            TypeAlerte.STOCK_FAIBLE
            if type_cible == TypeAlerte.RUPTURE_STOCK
            else TypeAlerte.RUPTURE_STOCK
        )
        AlertesService._resoudre(
            structure=item.structure,
            type_alerte=autre_type,
            medicament_nom=item.nom,
        )

        if AlertesService._alerte_active(
            structure=item.structure,
            type_alerte=type_cible,
            medicament_nom=item.nom,
        ):
            return

        donnees = {
            "medicament_nom": item.nom,
            "stock_disponible": stock_disponible,
            "stock_physique": item.quantite,
            "quantite_reservee": item.quantite_reservee,
            "seuil_alerte": seuil,
        }

        if type_cible == TypeAlerte.RUPTURE_STOCK:
            titre = "Rupture de stock"
            description = (
                f"Le stock de '{item.nom}' est en rupture "
                f"(0 disponible). Créez un nouvel approvisionnement."
            )
        else:
            titre = "Stock faible"
            description = (
                f"Le stock disponible de '{item.nom}' est inférieur ou "
                f"égal au seuil d'alerte ({stock_disponible} disponible(s) "
                f"pour un seuil de {seuil}). Accédez au module "
                f"Approvisionnement pour réapprovisionner."
            )

        AlertesService._creer(
            structure=item.structure,
            type_alerte=type_cible,
            donnees=donnees,
            titre=titre,
            description=description,
        )

    @staticmethod
    def analyser_stock(structure):
        """Analyse l'ensemble des médicaments du stock de la structure."""
        from stock.models import StockItem

        for item in StockItem.objects.filter(
            structure=structure,
            type_item=StockItem.TYPE_MEDICAMENT,
        ):
            AlertesService.analyser_item(item)

    # ------------------------------------------------------------------
    # Analyse de supervision (alertes de supervision)
    # ------------------------------------------------------------------

    @staticmethod
    def _moyenne_quotidienne(queryset, champ_date, jour_actuel):
        """Moyenne d'événements par jour sur la fenêtre de référence."""
        borne = jour_actuel - timedelta(days=FENETRE_MOYENNE_JOURS)
        total = queryset.filter(
            **{
                f"{champ_date}__date__gte": borne,
                f"{champ_date}__date__lt": jour_actuel,
            }
        ).count()
        return total / max(FENETRE_MOYENNE_JOURS, 1)

    @staticmethod
    def _utilisateur_le_plus_implique(queryset, champ_date, champ_user, jour_actuel):
        """Utilisateur le plus impliqué dans la situation du jour."""
        ligne = (
            queryset.filter(**{f"{champ_date}__date": jour_actuel})
            .exclude(**{f"{champ_user}__isnull": True})
            .values(champ_user)
            .annotate(nb=Count("id"))
            .order_by("-nb")
            .first()
        )
        if not ligne:
            return None
        from utilisateurs.models import Utilisateur

        try:
            return Utilisateur.objects.get(id=ligne[champ_user])
        except Utilisateur.DoesNotExist:
            return None

    @staticmethod
    def _analyser_retours_caisse(structure, jour):
        from ventes.models import RetourCaisse

        retours = RetourCaisse.objects.filter(structure=structure)
        nombre = retours.filter(effectue_le__date=jour).count()
        moyenne = AlertesService._moyenne_quotidienne(
            retours,
            "effectue_le",
            jour,
        )

        anormal = (
            nombre >= SEUIL_RETOURS_MINIMUM
            and nombre > moyenne * SEUIL_RETOURS_MULTIPLICATEUR
        )

        if not anormal:
            AlertesService._resoudre(
                structure=structure,
                type_alerte=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
            )
            return

        if AlertesService._alerte_active(
            structure=structure,
            type_alerte=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
        ):
            return

        concerne = AlertesService._utilisateur_le_plus_implique(
            retours,
            "effectue_le",
            "effectue_par",
            jour,
        )

        AlertesService._creer(
            structure=structure,
            type_alerte=TypeAlerte.RETOURS_CAISSE_ANORMAUX,
            donnees={
                "nombre": nombre,
                "moyenne": round(moyenne, 1),
                "date_concernee": f"{jour:%d/%m/%Y}",
            },
            titre="Retours caisse inhabituels",
            description=(
                f"Aujourd'hui, {nombre} retour(s) caisse ont été "
                f"enregistrés pour une moyenne habituelle de "
                f"{moyenne:.1f}. Analysez les causes de cette "
                f"augmentation."
            ),
            utilisateur_concerne=concerne,
        )

    @staticmethod
    def _analyser_ventes_annulees(structure, jour):
        from ventes.models import EtatVente, Vente

        annulations = Vente.objects.filter(
            structure=structure,
            etat=EtatVente.ANNULEE,
        )
        nombre = annulations.filter(annulee_le__date=jour).count()
        moyenne = AlertesService._moyenne_quotidienne(
            annulations,
            "annulee_le",
            jour,
        )

        anormal = (
            nombre >= SEUIL_ANNULATIONS_MINIMUM
            and nombre > moyenne * SEUIL_ANNULATIONS_MULTIPLICATEUR
        )

        if not anormal:
            AlertesService._resoudre(
                structure=structure,
                type_alerte=TypeAlerte.VENTES_ANNULEES_ANORMALES,
            )
            return

        if AlertesService._alerte_active(
            structure=structure,
            type_alerte=TypeAlerte.VENTES_ANNULEES_ANORMALES,
        ):
            return

        concerne = AlertesService._utilisateur_le_plus_implique(
            annulations,
            "annulee_le",
            "annulee_par",
            jour,
        )

        AlertesService._creer(
            structure=structure,
            type_alerte=TypeAlerte.VENTES_ANNULEES_ANORMALES,
            donnees={
                "nombre": nombre,
                "moyenne": round(moyenne, 1),
                "date_concernee": f"{jour:%d/%m/%Y}",
            },
            titre="Annulations de vente inhabituelles",
            description=(
                f"Aujourd'hui, {nombre} vente(s) ont été annulées avant "
                f"validation pour une moyenne habituelle de {moyenne:.1f}. "
                f"Ce volume peut révéler une erreur de saisie récurrente "
                f"ou un problème d'organisation à contrôler."
            ),
            utilisateur_concerne=concerne,
        )

    @staticmethod
    def analyser_supervision(structure):
        """Analyse les retours caisse et les annulations de vente."""
        jour = timezone.localdate()
        AlertesService._analyser_retours_caisse(structure, jour)
        AlertesService._analyser_ventes_annulees(structure, jour)

    @staticmethod
    def analyser_structure(structure):
        """Analyse complète d'une structure (stock + supervision)."""
        AlertesService.analyser_stock(structure)
        AlertesService.analyser_supervision(structure)

    # ------------------------------------------------------------------
    # Lecture
    # ------------------------------------------------------------------

    @staticmethod
    def marquer_lue(alerte, utilisateur):
        """Marque une alerte comme lue pour un utilisateur donné."""
        if not alerte.lu_par.filter(pk=utilisateur.pk).exists():
            alerte.lu_par.add(utilisateur)
        return alerte
