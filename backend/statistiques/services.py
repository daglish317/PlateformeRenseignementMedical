"""Services de calcul du module Statistiques (couche d'analyse en lecture seule).

Le module Statistiques est l'outil de pilotage du propriétaire : il ne
crée, ne modifie et ne supprime aucune donnée. Il agrège les données
déjà enregistrées (ventes, caisse, approvisionnements, stock, alertes)
sur une période donnée pour en tirer des indicateurs.

Accès : propriétaire uniquement. Les contrôles d'autorisation sont
effectués au niveau des vues (niveau système) : le gestionnaire et le
caissier n'ont aucun accès aux statistiques financières.

Règle fondamentale : les statistiques financières s'appuient sur les
paiements réellement validés par la caisse (ventes PAYEE). Une vente
préparée puis annulée ne génère aucune recette.
"""

import uuid
from collections import defaultdict
from datetime import date, timedelta

from django.db.models import (
    Count,
    F,
    Sum,
)
from django.utils import timezone

from alertes.models import Alerte, TypeAlerte
from stock.models import (
    Approvisionnement,
    LigneApprovisionnement,
    Medicament,
    StockItem,
)
from ventes.models import (
    EtatVente,
    LigneVente,
    ModePaiement,
    Paiement,
    RetourCaisse,
    RetourCaisseLigne,
    Vente,
)

# Périodes rapides proposées au propriétaire (§3 de la spécification).
PERIODES_RAPIDES = (
    "aujourdhui",
    "hier",
    "semaine",
    "semaine_precedente",
    "mois",
    "mois_precedent",
    "annee",
    "personnalisee",
)


def _est_uuid(valeur):
    try:
        uuid.UUID(str(valeur))
        return True
    except (ValueError, AttributeError, TypeError):
        return False


def _variation(actuel, precedent):
    """Variation en pourcentage entre deux valeurs.

    Retourne None lorsque la variation n'est pas calculable (aucune
    donnée sur la période précédente).
    """
    if precedent in (None, 0):
        if actuel in (None, 0):
            return None
        return 100.0
    if actuel is None:
        return None
    return round((actuel - precedent) / precedent * 100, 2)


class PeriodeResolue:
    """Période résolue : bornes (inclusives), libellé et période précédente."""

    def __init__(self, debut, fin, libelle, precedente=None):
        self.debut = debut
        self.fin = fin
        self.libelle = libelle
        self.precedente = precedente

    def as_dict(self):
        return {
            "libelle": self.libelle,
            "debut": f"{self.debut:%Y-%m-%d}" if self.debut else None,
            "fin": f"{self.fin:%Y-%m-%d}" if self.fin else None,
            "precedente": (
                self.precedente.as_dict() if self.precedente else None
            ),
        }


def _precedente_simple(jour, libelle):
    return PeriodeResolue(
        jour - timedelta(days=1),
        jour - timedelta(days=1),
        libelle,
    )


def resoudre_periode(periode, date_debut=None, date_fin=None):
    """Résout la période demandée et sa période précédente équivalente.

    En cas de période inconnue ou vide, la période n'est pas bornée
    (toutes les données) et aucune période précédente n'est définie.
    """
    aujourdhui = timezone.localdate()
    periode = (periode or "").strip().lower()

    if periode == "aujourdhui":
        return PeriodeResolue(
            aujourdhui,
            aujourdhui,
            f"Aujourd'hui — {aujourdhui:%d/%m/%Y}",
            precedente=_precedente_simple(aujourdhui, "Hier"),
        )

    if periode == "hier":
        hier = aujourdhui - timedelta(days=1)
        return PeriodeResolue(
            hier,
            hier,
            f"Hier — {hier:%d/%m/%Y}",
            precedente=_precedente_simple(hier, "Avant-hier"),
        )

    if periode == "semaine":
        debut = aujourdhui - timedelta(days=aujourdhui.weekday())
        fin = aujourdhui
        precedent_debut = debut - timedelta(days=7)
        return PeriodeResolue(
            debut,
            fin,
            f"Cette semaine — depuis le {debut:%d/%m/%Y}",
            precedente=PeriodeResolue(
                precedent_debut,
                precedent_debut + timedelta(days=6),
                "Semaine précédente",
            ),
        )

    if periode == "semaine_precedente":
        debut = aujourdhui - timedelta(days=aujourdhui.weekday() + 7)
        fin = debut + timedelta(days=6)
        return PeriodeResolue(
            debut,
            fin,
            f"Semaine précédente — du {debut:%d/%m/%Y} au {fin:%d/%m/%Y}",
            precedente=PeriodeResolue(
                debut - timedelta(days=7),
                fin - timedelta(days=7),
                "Semaine d'avant",
            ),
        )

    if periode == "mois":
        debut = aujourdhui.replace(day=1)
        fin = aujourdhui
        annee, mois = debut.year, debut.month
        debut_precedent = (annee, mois - 1) if mois > 1 else (annee - 1, 12)
        d_prec = date(debut_precedent[0], debut_precedent[1], 1)
        return PeriodeResolue(
            debut,
            fin,
            f"Ce mois — depuis le {debut:%d/%m/%Y}",
            precedente=PeriodeResolue(
                d_prec,
                debut - timedelta(days=1),
                "Mois précédent",
            ),
        )

    if periode == "mois_precedent":
        mois_actuel = aujourdhui.replace(day=1)
        debut = (mois_actuel - timedelta(days=1)).replace(day=1)
        fin = mois_actuel - timedelta(days=1)
        deux_prec = debut - timedelta(days=1)
        return PeriodeResolue(
            debut,
            fin,
            f"Mois précédent — {debut:%B %Y}",
            precedente=PeriodeResolue(
                deux_prec.replace(day=1),
                debut - timedelta(days=1),
                "Mois d'avant",
            ),
        )

    if periode == "annee":
        debut = date(aujourdhui.year, 1, 1)
        fin = aujourdhui
        return PeriodeResolue(
            debut,
            fin,
            f"Cette année — {aujourdhui.year}",
            precedente=PeriodeResolue(
                date(aujourdhui.year - 1, 1, 1),
                date(aujourdhui.year - 1, 12, 31),
                "Année précédente",
            ),
        )

    if periode == "personnalisee":
        debut = fin = None
        libelle = "Période personnalisée"
        if date_debut:
            debut = date_debut
            libelle += f" du {date_debut:%d/%m/%Y}"
        if date_fin:
            fin = date_fin
            libelle += f" au {date_fin:%d/%m/%Y}"
        if not debut and not fin:
            return PeriodeResolue(None, None, "Toute la période")
        precedente = None
        if debut and fin and debut <= fin:
            nouveau_debut, nouveau_fin = _precedente_calendaire(debut, fin)
            precedente = PeriodeResolue(
                nouveau_debut,
                nouveau_fin,
                "Période précédente",
            )
        return PeriodeResolue(debut, fin, libelle, precedente=precedente)

    return PeriodeResolue(None, None, "Toute la période")


def _precedente_calendaire(debut, fin):
    """Période précédente alignée sur la période personnalisée.

    - Période complète alignée sur un mois : le mois précédent complet.
    - Période complète alignée sur une année : l'année précédente.
    - Période complète alignée sur une semaine : la semaine précédente.
    - Sinon : fenêtre de même longueur terminant la veille du début.
    """
    if debut.day == 1:
        dernier_jour_mois = (
            (debut.replace(day=1) + timedelta(days=32)).replace(day=1)
            - timedelta(days=1)
        )
        if fin == dernier_jour_mois:
            nouveau_fin = debut - timedelta(days=1)
            return nouveau_fin.replace(day=1), nouveau_fin

    if (
        debut.month == 1
        and debut.day == 1
        and fin.month == 12
        and fin.day == 31
    ):
        return (
            date(debut.year - 1, 1, 1),
            date(debut.year - 1, 12, 31),
        )

    if debut.weekday() == 0 and fin.weekday() == 6 and (fin - debut).days == 6:
        return debut - timedelta(days=7), fin - timedelta(days=7)

    longueur = (fin - debut).days + 1
    nouveau_fin = debut - timedelta(days=1)
    return nouveau_fin - timedelta(days=longueur - 1), nouveau_fin


def _bornes(champ, periode, date_only=False):
    """Conditions de filtrage sur la période (bornes inclusives)."""
    kwargs = {}
    suffixe = "date__gte" if not date_only else "gte"
    if periode and periode.debut:
        kwargs[f"{champ}__{suffixe}"] = periode.debut
    if periode and periode.fin:
        suffixe_fin = "date__lte" if not date_only else "lte"
        kwargs[f"{champ}__{suffixe_fin}"] = periode.fin
    return kwargs


def _serie_valeurs(donnees, debut, fin):
    """Découpe une liste de couples (date, valeur) en compartiments.

    Les compartiments manquants sont remplis à zéro pour que le
    graphique reste continu et lisible (§5).
    """
    if not debut or not fin:
        return [
            {"periode": "Tout", "valeur": sum(v for _, v in donnees)}
        ]

    nb_jours = (fin - debut).days + 1

    if nb_jours <= 1:
        def cle(v):
            return v.hour if hasattr(v, "hour") else 0

        portees = list(range(24))
        libelle = lambda c: f"{c:02d}h"
    elif nb_jours <= 31:
        def cle(v):
            return v.date() if hasattr(v, "date") else v

        portees = [debut + timedelta(days=i) for i in range(nb_jours)]
        libelle = lambda c: f"{c:%d/%m}"
    elif nb_jours <= 120:
        def cle(v):
            d = v.date() if hasattr(v, "date") else v
            return d - timedelta(days=d.weekday())

        premier = debut - timedelta(days=debut.weekday())
        dernier = fin - timedelta(days=fin.weekday())
        portees = [
            premier + timedelta(days=7 * i)
            for i in range(((dernier - premier).days // 7) + 1)
        ]
        libelle = lambda c: f"Semaine du {c:%d/%m}"
    else:
        def cle(v):
            d = v.date() if hasattr(v, "date") else v
            return (d.year, d.month)

        portees = []
        annee, mois = debut.year, debut.month
        while (annee, mois) <= (fin.year, fin.month):
            portees.append((annee, mois))
            mois += 1
            if mois > 12:
                mois = 1
                annee += 1
        libelle = lambda c: f"{c[1]:02d}/{c[0]}"

    compteurs = defaultdict(int)
    for valeur_date, valeur in donnees:
        compteurs[cle(valeur_date)] += valeur

    return [
        {"periode": libelle(compartiment), "valeur": compteurs.get(compartiment, 0)}
        for compartiment in portees
    ]


def _meilleurs_compartiments(series, limite=3, inverse=False):
    """Compartiments les plus actifs (ou les plus faibles) d'une série."""
    if not series:
        return []
    triee = sorted(series, key=lambda s: s["valeur"], reverse=not inverse)
    return triee[:limite]


class StatistiquesService:

    # ------------------------------------------------------------------
    # Requêtes de base
    # ------------------------------------------------------------------

    @staticmethod
    def _ventes_validees(structure_id, periode):
        return Vente.objects.filter(
            structure_id=structure_id,
            etat=EtatVente.PAYEE,
        ).filter(**_bornes("validee_le", periode))

    @staticmethod
    def _ventes_annulees(structure_id, periode):
        return Vente.objects.filter(
            structure_id=structure_id,
            etat=EtatVente.ANNULEE,
        ).filter(**_bornes("annulee_le", periode))

    @staticmethod
    def _retours(structure_id, periode):
        return RetourCaisse.objects.filter(
            structure_id=structure_id,
        ).filter(**_bornes("effectue_le", periode))

    @staticmethod
    def _approvisionnements(structure_id, periode):
        return Approvisionnement.objects.filter(
            structure_id=structure_id,
        ).filter(**_bornes("date_reception", periode, date_only=True))

    @staticmethod
    def _lignes_ventes(structure_id, periode):
        return LigneVente.objects.filter(
            vente__structure_id=structure_id,
            vente__etat=EtatVente.PAYEE,
        ).filter(**_bornes("vente__validee_le", periode))

    @staticmethod
    def _lignes_retours(structure_id, periode):
        return RetourCaisseLigne.objects.filter(
            retour__structure_id=structure_id,
        ).filter(**_bornes("retour__effectue_le", periode))

    # ------------------------------------------------------------------
    # Filtres de la spécification (§15)
    # ------------------------------------------------------------------

    @staticmethod
    def _appliquer_filtre_produit(queryset, champ_medicament, filtres):
        produit = (filtres.get("produit") or "").strip()
        if not produit:
            return queryset
        if _est_uuid(produit):
            return queryset.filter(**{f"{champ_medicament}__id": produit})
        return queryset.filter(**{f"{champ_medicament}__nom__icontains": produit})

    @staticmethod
    def _appliquer_filtre_vente(
        queryset,
        filtres,
        champ_id="id",
        champ_numero="numero",
    ):
        vente = (filtres.get("vente") or "").strip()
        if not vente:
            return queryset
        if _est_uuid(vente):
            return queryset.filter(**{champ_id: vente})
        return queryset.filter(**{f"{champ_numero}__icontains": vente})

    @staticmethod
    def _appliquer_filtre_approvisionnement(
        queryset,
        filtres,
        champ_id="id",
        champ_numero="numero",
    ):
        appro = (filtres.get("approvisionnement") or "").strip()
        if not appro:
            return queryset
        if _est_uuid(appro):
            return queryset.filter(**{champ_id: appro})
        return queryset.filter(**{f"{champ_numero}__icontains": appro})

    @staticmethod
    def _appliquer_filtre_caisse(queryset, filtres, champ_mode="paiement__mode"):
        mode = (filtres.get("caisse") or "").strip().upper()
        if mode not in ModePaiement.values:
            return queryset
        return queryset.filter(**{champ_mode: mode})

    @staticmethod
    def _nb_produits_vendus(ventes, filtres):
        """Quantités d'articles vendues, cohérentes avec le filtre produit.

        Sans filtre produit : somme des nb_articles des ventes.
        Avec filtre produit : somme des quantités des lignes du produit
        concerné uniquement.
        """
        if (filtres.get("produit") or "").strip():
            lignes = LigneVente.objects.filter(vente__in=ventes)
            lignes = StatistiquesService._appliquer_filtre_produit(
                lignes, "medicament", filtres
            )
            return lignes.aggregate(total=Sum("quantite"))["total"] or 0
        return ventes.aggregate(total=Sum("nb_articles"))["total"] or 0

    @staticmethod
    def _ca_ventes(ventes, filtres):
        """Chiffre d'affaires, cohérent avec le filtre produit.

        Sans filtre produit : somme des montants des ventes.
        Avec filtre produit : somme des montants des lignes du produit
        concerné uniquement.
        """
        if (filtres.get("produit") or "").strip():
            lignes = LigneVente.objects.filter(vente__in=ventes)
            lignes = StatistiquesService._appliquer_filtre_produit(
                lignes, "medicament", filtres
            )
            return lignes.aggregate(total=Sum("montant"))["total"] or 0
        return ventes.aggregate(total=Sum("montant_total"))["total"] or 0

    @staticmethod
    def _filtres_actifs(filtres):
        """Filtres réellement actifs (pour les libellés d'export)."""
        actifs = []
        if (filtres.get("produit") or "").strip():
            actifs.append(f"Produit : {filtres['produit'].strip()}")
        if (filtres.get("type") or "").strip():
            actifs.append(f"Type : {filtres['type'].strip()}")
        if (filtres.get("vente") or "").strip():
            actifs.append(f"Vente : {filtres['vente'].strip()}")
        if (filtres.get("approvisionnement") or "").strip():
            actifs.append(
                f"Approvisionnement : {filtres['approvisionnement'].strip()}"
            )
        if (filtres.get("caisse") or "").strip():
            actifs.append(f"Caisse : {filtres['caisse'].strip()}")
        return actifs

    @staticmethod
    def _libelle_filtres(filtres):
        actifs = StatistiquesService._filtres_actifs(filtres)
        return " ; ".join(actifs) if actifs else "Aucun filtre"

    # ------------------------------------------------------------------
    # Vue générale (§4)
    # ------------------------------------------------------------------

    @staticmethod
    def vue_generale(structure_id, periode, filtres=None):
        filtres = filtres or {}

        ventes = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes = StatistiquesService._appliquer_filtre_vente(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_caisse(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_produit(
            ventes.filter(lignes__isnull=False).distinct(), "lignes__medicament", filtres
        )

        nb_ventes = ventes.count()
        nb_produits = StatistiquesService._nb_produits_vendus(ventes, filtres)
        ca = StatistiquesService._ca_ventes(ventes, filtres)

        appros = StatistiquesService._approvisionnements(
            structure_id, periode
        )
        appros = StatistiquesService._appliquer_filtre_approvisionnement(
            appros, filtres
        )
        appros = StatistiquesService._appliquer_filtre_produit(
            appros.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        nb_appros = appros.count()
        quantite_appros = (
            LigneApprovisionnement.objects.filter(
                approvisionnement__in=appros
            ).aggregate(total=Sum("quantite"))["total"]
            or 0
        )

        stock = StatistiquesService.analyse_stock(structure_id, filtres=filtres)

        paiements = Paiement.objects.filter(
            vente__structure_id=structure_id,
            vente__etat=EtatVente.PAYEE,
        ).filter(**_bornes("effectue_le", periode))
        paiements = StatistiquesService._appliquer_filtre_vente(
            paiements,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("caisse") or "").strip().upper() in ModePaiement.values:
            paiements = paiements.filter(
                mode=filtres["caisse"].strip().upper()
            )

        retours = StatistiquesService._retours(structure_id, periode)
        retours = StatistiquesService._appliquer_filtre_vente(
            retours,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("produit") or "").strip():
            retours = StatistiquesService._appliquer_filtre_produit(
                retours.filter(lignes__isnull=False).distinct(),
                "lignes__medicament",
                filtres,
            )
        annulations = StatistiquesService._ventes_annulees(
            structure_id, periode
        )
        annulations = StatistiquesService._appliquer_filtre_vente(
            annulations, filtres
        )

        evolution = StatistiquesService._evolutions_ventes(
            structure_id, periode, filtres
        )
        evolution_appros = StatistiquesService._evolutions_appros(
            structure_id, periode, filtres
        )

        return {
            "periode": periode.as_dict(),
            "ventes": {
                "nb_validees": nb_ventes,
                "nb_produits_vendus": nb_produits,
                "ca": ca,
                "evolution_ventes": evolution[0],
                "evolution_produits": evolution[1],
            },
            "approvisionnements": {
                "nombre": nb_appros,
                "quantite_totale": quantite_appros,
                "evolution": evolution_appros,
            },
            "stock": {
                "valeur_actuelle": stock["valeur"]["vente"],
                "valeur_achat": stock["valeur"]["achat"],
                "nb_references": stock["nb_references"],
                "nb_references_disponibles": stock["nb_disponibles"],
                "nb_ruptures": stock["nb_ruptures"],
                "nb_sous_seuil": stock["nb_stocks_faibles"],
            },
            "caisse": {
                "nb_paiements_valides": paiements.count(),
                "nb_retours": retours.count(),
                "nb_annulations": annulations.count(),
                "montant_retours": (
                    retours.aggregate(total=Sum("montant_total"))["total"] or 0
                ),
            },
        }

    @staticmethod
    def _evolutions_ventes(structure_id, periode, filtres):
        """Variation du nombre de ventes et de produits vs période précédente."""
        precedent = periode.precedente
        if not precedent:
            return None, None

        ventes = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes = StatistiquesService._appliquer_filtre_vente(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_caisse(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_produit(
            ventes.filter(lignes__isnull=False).distinct(), "lignes__medicament", filtres
        )
        nb_actuel = ventes.count()
        produits_actuel = StatistiquesService._nb_produits_vendus(
            ventes, filtres
        )

        ventes_prev = StatistiquesService._ventes_validees(
            structure_id, precedent
        )
        ventes_prev = StatistiquesService._appliquer_filtre_vente(
            ventes_prev, filtres
        )
        ventes_prev = StatistiquesService._appliquer_filtre_caisse(
            ventes_prev, filtres
        )
        ventes_prev = StatistiquesService._appliquer_filtre_produit(
            ventes_prev.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        nb_precedent = ventes_prev.count()
        produits_precedent = StatistiquesService._nb_produits_vendus(
            ventes_prev, filtres
        )

        return (
            _variation(nb_actuel, nb_precedent),
            _variation(produits_actuel, produits_precedent),
        )

    @staticmethod
    def _evolutions_appros(structure_id, periode, filtres):
        precedent = periode.precedente
        if not precedent:
            return None

        appros = StatistiquesService._approvisionnements(
            structure_id, periode
        )
        appros = StatistiquesService._appliquer_filtre_approvisionnement(
            appros, filtres
        )
        appros = StatistiquesService._appliquer_filtre_produit(
            appros.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        nb_actuel = appros.count()

        appros_prev = StatistiquesService._approvisionnements(
            structure_id, precedent
        )
        appros_prev = StatistiquesService._appliquer_filtre_approvisionnement(
            appros_prev, filtres
        )
        appros_prev = StatistiquesService._appliquer_filtre_produit(
            appros_prev.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        nb_precedent = appros_prev.count()

        return _variation(nb_actuel, nb_precedent)

    # ------------------------------------------------------------------
    # Analyse des ventes (§5)
    # ------------------------------------------------------------------

    @staticmethod
    def analyse_ventes(structure_id, periode, filtres=None):
        filtres = filtres or {}
        ventes = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes = StatistiquesService._appliquer_filtre_vente(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_caisse(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_produit(
            ventes.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )

        nb_ventes = ventes.count()
        nb_produits = StatistiquesService._nb_produits_vendus(ventes, filtres)
        evolution_ventes, evolution_produits = (
            StatistiquesService._evolutions_ventes(structure_id, periode, filtres)
        )

        donnees_ventes = list(
            ventes.values_list("validee_le", "validee_le").order_by("validee_le")
        )
        series_ventes = _serie_valeurs(
            [(v, 1) for v, _ in donnees_ventes],
            periode.debut,
            periode.fin,
        )

        lignes = LigneVente.objects.filter(vente__in=ventes)
        lignes = StatistiquesService._appliquer_filtre_produit(
            lignes, "medicament", filtres
        )
        donnees_produits = list(
            lignes.values_list("vente__validee_le").annotate(
                total=Sum("quantite")
            )
        )
        series_produits = _serie_valeurs(
            [(d[0], d[1]) for d in donnees_produits],
            periode.debut,
            periode.fin,
        )

        return {
            "periode": periode.as_dict(),
            "nb_ventes": nb_ventes,
            "nb_produits_vendus": nb_produits,
            "evolution_ventes": evolution_ventes,
            "evolution_produits": evolution_produits,
            "series_ventes": series_ventes,
            "series_produits": series_produits,
            "meilleures_periodes": _meilleurs_compartiments(
                series_ventes, limite=3
            ),
            "plus_faibles_periodes": _meilleurs_compartiments(
                series_ventes, limite=3, inverse=True
            ),
        }

    # ------------------------------------------------------------------
    # Produits les plus / les moins vendus (§6 et §7)
    # ------------------------------------------------------------------

    @staticmethod
    def produits_vendus(structure_id, periode, filtres=None):
        filtres = filtres or {}
        lignes = StatistiquesService._lignes_ventes(
            structure_id, periode
        )
        lignes = StatistiquesService._appliquer_filtre_produit(
            lignes, "medicament", filtres
        )
        lignes = StatistiquesService._appliquer_filtre_vente(
            lignes,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        lignes = StatistiquesService._appliquer_filtre_caisse(
            lignes,
            filtres,
            champ_mode="vente__paiement__mode",
        )

        vendus = defaultdict(
            lambda: {"quantite": 0, "montant": 0}
        )
        for ligne in (
            lignes.values("medicament__id", "medicament__nom")
            .annotate(quantite=Sum("quantite"), montant=Sum("montant"))
            .order_by("-quantite")
        ):
            vendus[ligne["medicament__id"]] = {
                "nom": ligne["medicament__nom"],
                "quantite": ligne["quantite"],
                "montant": ligne["montant"] or 0,
            }

        retours = StatistiquesService._lignes_retours(
            structure_id, periode
        )
        retours = StatistiquesService._appliquer_filtre_produit(
            retours, "medicament", filtres
        )
        retours = StatistiquesService._appliquer_filtre_vente(
            retours,
            filtres,
            champ_id="retour__vente__id",
            champ_numero="retour__vente__numero",
        )
        for ligne in retours.values("medicament__id").annotate(
            quantite=Sum("quantite")
        ):
            if ligne["medicament__id"] in vendus:
                vendus[ligne["medicament__id"]]["quantite"] -= ligne["quantite"]

        classement = sorted(
            (
                {
                    "medicament_id": cle,
                    "nom": donnees["nom"],
                    "quantite": max(donnees["quantite"], 0),
                    "montant": donnees["montant"],
                }
                for cle, donnees in vendus.items()
            ),
            key=lambda p: p["quantite"],
            reverse=True,
        )
        actifs = [p for p in classement if p["quantite"] > 0]

        return {
            "periode": periode.as_dict(),
            "plus_vendus": actifs[:10],
            "moins_vendus": actifs[-10:][::-1] if actifs else [],
        }

    # ------------------------------------------------------------------
    # Analyse des approvisionnements (§8)
    # ------------------------------------------------------------------

    @staticmethod
    def analyse_approvisionnements(structure_id, periode, filtres=None):
        filtres = filtres or {}
        appros = StatistiquesService._approvisionnements(
            structure_id, periode
        )
        appros = StatistiquesService._appliquer_filtre_approvisionnement(
            appros, filtres
        )
        appros = StatistiquesService._appliquer_filtre_produit(
            appros.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )

        lignes = LigneApprovisionnement.objects.filter(
            approvisionnement__in=appros
        )
        if (filtres.get("type") or "").strip():
            if not filtres["type"].strip().upper() == "MEDICAMENT":
                lignes = lignes.none()

        nombre = appros.count()
        quantite_totale = lignes.aggregate(total=Sum("quantite"))["total"] or 0
        montant_total = 0
        for ligne in lignes:
            montant_total += ligne.prix_achat * ligne.quantite
        montant_total = round(montant_total, 2)

        evolution = StatistiquesService._evolutions_appros(
            structure_id, periode, filtres
        )

        donnees = list(
            appros.values_list("date_reception", "date_reception").order_by(
                "date_reception"
            )
        )
        series_nombre = _serie_valeurs(
            [(d, 1) for d, _ in donnees],
            periode.debut,
            periode.fin,
        )

        donnees_quantite = (
            lignes.annotate(date_reception=F("approvisionnement__date_reception"))
            .values("date_reception")
            .annotate(quantite=Sum("quantite"))
            .order_by("date_reception")
        )
        series_quantite = _serie_valeurs(
            [(r["date_reception"], r["quantite"]) for r in donnees_quantite],
            periode.debut,
            periode.fin,
        )

        frequents = (
            lignes.values("medicament__nom")
            .annotate(
                nb_approvisionnements=Count("approvisionnement_id", distinct=True),
                quantite_totale=Sum("quantite"),
            )
            .order_by("-nb_approvisionnements", "-quantite_totale")[:10]
        )

        return {
            "periode": periode.as_dict(),
            "nombre": nombre,
            "quantite_totale": quantite_totale,
            "montant_total": montant_total,
            "evolution": evolution,
            "series_nombre": series_nombre,
            "series_quantite": series_quantite,
            "periodes_forte_reception": _meilleurs_compartiments(
                series_quantite, limite=3
            ),
            "produits_frequents": [
                {
                    "nom": p["medicament__nom"],
                    "nb_approvisionnements": p["nb_approvisionnements"],
                    "quantite_totale": p["quantite_totale"],
                }
                for p in frequents
            ],
        }

    # ------------------------------------------------------------------
    # Analyse du stock (§9) et valeur du stock (§13)
    # ------------------------------------------------------------------

    @staticmethod
    def analyse_stock(structure_id, filtres=None):
        filtres = filtres or {}
        items = StockItem.objects.filter(structure_id=structure_id)
        type_filtre = (filtres.get("type") or "").strip().upper()
        if type_filtre in {
            StockItem.TYPE_MEDICAMENT,
            StockItem.TYPE_EQUIPEMENT,
            StockItem.TYPE_CONSOMMABLE,
        }:
            items = items.filter(type_item=type_filtre)

        references = 0
        disponibles = 0
        ruptures = 0
        stocks_faibles = 0
        par_type = defaultdict(
            lambda: {"nb_references": 0, "nb_disponibles": 0, "nb_ruptures": 0, "nb_stocks_faibles": 0}
        )

        for item in items:
            references += 1
            disponible = item.stock_disponible
            par_type[item.type_item]["nb_references"] += 1
            if disponible > 0:
                disponibles += 1
                par_type[item.type_item]["nb_disponibles"] += 1
                if disponible <= item.seuil_alerte:
                    stocks_faibles += 1
                    par_type[item.type_item]["nb_stocks_faibles"] += 1
            else:
                ruptures += 1
                par_type[item.type_item]["nb_ruptures"] += 1

        evolution_ruptures = StatistiquesService._evolution_ruptures(
            structure_id
        )
        produits_ruptures = StatistiquesService._produits_en_rupture(
            structure_id
        )

        return {
            "nb_references": references,
            "nb_disponibles": disponibles,
            "nb_ruptures": ruptures,
            "nb_stocks_faibles": stocks_faibles,
            "par_type": [
                {
                    "type": cle,
                    "nb_references": donnees["nb_references"],
                    "nb_disponibles": donnees["nb_disponibles"],
                    "nb_ruptures": donnees["nb_ruptures"],
                    "nb_stocks_faibles": donnees["nb_stocks_faibles"],
                }
                for cle, donnees in par_type.items()
            ],
            "evolution_ruptures": evolution_ruptures,
            "produits_ruptures": produits_ruptures,
            "valeur": StatistiquesService.valeur_stock(
                structure_id, filtres=filtres
            ),
        }

    @staticmethod
    def _evolution_ruptures(structure_id):
        """Évolution du nombre de ruptures signalées.

        Source : alertes de rupture générées (système de surveillance),
        comparées sur la période précédente de 30 jours.
        """
        aujourdhui = timezone.localdate()
        actuel = Alerte.objects.filter(
            structure_id=structure_id,
            type=TypeAlerte.RUPTURE_STOCK,
            cree_le__date__gte=aujourdhui - timedelta(days=29),
        ).count()
        precedent = Alerte.objects.filter(
            structure_id=structure_id,
            type=TypeAlerte.RUPTURE_STOCK,
            cree_le__date__gte=aujourdhui - timedelta(days=59),
            cree_le__date__lt=aujourdhui - timedelta(days=29),
        ).count()
        return {
            "actuel": actuel,
            "precedent": precedent,
            "variation": _variation(actuel, precedent),
        }

    @staticmethod
    def _produits_en_rupture(structure_id):
        """Produits connaissant le plus de ruptures sur les 30 derniers jours."""
        ligne = (
            Alerte.objects.filter(
                structure_id=structure_id,
                type=TypeAlerte.RUPTURE_STOCK,
                cree_le__date__gte=timezone.localdate() - timedelta(days=29),
            )
            .values("donnees__medicament_nom")
            .annotate(nb_ruptures=Count("id"))
            .order_by("-nb_ruptures")[:10]
        )
        return [
            {
                "nom": p["donnees__medicament_nom"],
                "nb_ruptures": p["nb_ruptures"],
            }
            for p in ligne
            if p["donnees__medicament_nom"]
        ]

    @staticmethod
    def _ruptures_alertes(structure_id, periode, filtres=None):
        """Nombre d'alertes de rupture sur une periode donnee."""
        filtres = filtres or {}
        queryset = Alerte.objects.filter(
            structure_id=structure_id,
            type=TypeAlerte.RUPTURE_STOCK,
        ).filter(**_bornes("cree_le", periode))

        produit = (filtres.get("produit") or "").strip()
        if produit:
            queryset = queryset.filter(donnees__medicament_nom__icontains=produit)

        type_filtre = (filtres.get("type") or "").strip().upper()
        if type_filtre and type_filtre != StockItem.TYPE_MEDICAMENT:
            return 0

        return queryset.count()

    @staticmethod
    def valeur_stock(structure_id, filtres=None):
        """Valeur d'achat et valeur potentielle de vente du stock.

        - Valeur d'achat : quantité en stock × dernier prix d'achat connu
          (dernière ligne d'approvisionnement du produit).
        - Valeur de vente : quantité en stock × prix de vente actuel.
        """
        filtres = filtres or {}
        medicaments = {
            m.nom: m
            for m in Medicament.objects.filter(structure_id=structure_id)
        }

        derniers_prix_achat = {}
        for ligne in (
            LigneApprovisionnement.objects.filter(
                approvisionnement__structure_id=structure_id
            )
            .select_related("medicament")
            .order_by(
                "-approvisionnement__date_reception",
                "-approvisionnement__cree_le",
                "-id",
            )
        ):
            nom = ligne.medicament.nom
            if nom not in derniers_prix_achat:
                derniers_prix_achat[nom] = ligne.prix_achat

        items = StockItem.objects.filter(
            structure_id=structure_id,
            type_item=StockItem.TYPE_MEDICAMENT,
        )
        type_filtre = (filtres.get("type") or "").strip().upper()
        if type_filtre in {
            StockItem.TYPE_MEDICAMENT,
            StockItem.TYPE_EQUIPEMENT,
            StockItem.TYPE_CONSOMMABLE,
        }:
            items = items.filter(type_item=type_filtre)

        valeur_achat = 0
        valeur_vente = 0
        for item in items:
            medicament = medicaments.get(item.nom)
            prix_achat = derniers_prix_achat.get(item.nom)
            prix_vente = medicament.prix_vente if medicament else None
            if prix_achat is not None:
                valeur_achat += item.quantite * prix_achat
            if prix_vente is not None:
                valeur_vente += item.quantite * prix_vente

        return {
            "achat": round(valeur_achat, 2),
            "vente": round(valeur_vente, 2),
        }

    # ------------------------------------------------------------------
    # Analyse de la caisse (§10 et §11)
    # ------------------------------------------------------------------

    @staticmethod
    def analyse_caisse(structure_id, periode, filtres=None):
        filtres = filtres or {}

        paiements = Paiement.objects.filter(
            vente__structure_id=structure_id,
            vente__etat=EtatVente.PAYEE,
        ).filter(**_bornes("effectue_le", periode))
        paiements = StatistiquesService._appliquer_filtre_vente(
            paiements,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("caisse") or "").strip().upper() in ModePaiement.values:
            paiements = paiements.filter(
                mode=filtres["caisse"].strip().upper()
            )
        paiements = StatistiquesService._appliquer_filtre_produit(
            paiements.filter(vente__lignes__isnull=False).distinct(),
            "vente__lignes__medicament",
            filtres,
        )

        nb_paiements = paiements.count()
        montant_paiements = (
            paiements.aggregate(total=Sum("montant"))["total"] or 0
        )

        retours = StatistiquesService._retours(structure_id, periode)
        retours = StatistiquesService._appliquer_filtre_vente(
            retours,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("produit") or "").strip():
            retours = StatistiquesService._appliquer_filtre_produit(
                retours.filter(lignes__isnull=False).distinct(),
                "lignes__medicament",
                filtres,
            )
        nb_retours = retours.count()
        montant_retours = (
            retours.aggregate(total=Sum("montant_total"))["total"] or 0
        )

        annulations = StatistiquesService._ventes_annulees(
            structure_id, periode
        )
        annulations = StatistiquesService._appliquer_filtre_vente(
            annulations, filtres
        )
        nb_annulations = annulations.count()

        def _evolution_annulations():
            precedent = periode.precedente
            if not precedent:
                return None
            precedent_qs = (
                StatistiquesService._ventes_annulees(structure_id, precedent)
                .filter(**_bornes("annulee_le", precedent))
            )
            precedent_qs = StatistiquesService._appliquer_filtre_vente(
                precedent_qs,
                filtres,
            )
            nb_precedent = precedent_qs.count()
            return _variation(nb_annulations, nb_precedent)

        def _evolution_retours():
            precedent = periode.precedente
            if not precedent:
                return None
            nb_precedent = StatistiquesService._retours(
                structure_id, precedent
            )
            nb_precedent = StatistiquesService._appliquer_filtre_vente(
                nb_precedent,
                filtres,
                champ_id="vente__id",
                champ_numero="vente__numero",
            )
            if (filtres.get("produit") or "").strip():
                nb_precedent = StatistiquesService._appliquer_filtre_produit(
                    nb_precedent.filter(lignes__isnull=False).distinct(),
                    "lignes__medicament",
                    filtres,
                )
            nb_precedent = nb_precedent.count()
            return _variation(nb_retours, nb_precedent)

        def _evolution_paiements():
            precedent = periode.precedente
            if not precedent:
                return None
            qs = Paiement.objects.filter(
                vente__structure_id=structure_id,
                vente__etat=EtatVente.PAYEE,
            ).filter(**_bornes("effectue_le", precedent))
            if (filtres.get("caisse") or "").strip().upper() in ModePaiement.values:
                qs = qs.filter(mode=filtres["caisse"].strip().upper())
            qs = StatistiquesService._appliquer_filtre_vente(
                qs,
                filtres,
                champ_id="vente__id",
                champ_numero="vente__numero",
            )
            qs = StatistiquesService._appliquer_filtre_produit(
                qs.filter(vente__lignes__isnull=False).distinct(),
                "vente__lignes__medicament",
                filtres,
            )
            return _variation(nb_paiements, qs.count())

        donnees_retours = list(
            retours.values_list("effectue_le", "effectue_le").order_by(
                "effectue_le"
            )
        )
        series_retours = _serie_valeurs(
            [(d, 1) for d, _ in donnees_retours],
            periode.debut,
            periode.fin,
        )

        donnees_annulations = list(
            annulations.values_list("annulee_le", "annulee_le").order_by(
                "annulee_le"
            )
        )
        series_annulations = _serie_valeurs(
            [(d, 1) for d, _ in donnees_annulations],
            periode.debut,
            periode.fin,
        )

        nb_jours = max(
            (periode.fin - periode.debut).days + 1
            if periode.debut and periode.fin
            else 1,
            1,
        )
        frequence_retours = round(nb_retours / nb_jours, 2)

        par_mode = (
            paiements.values("mode")
            .annotate(nombre=Count("id"), montant=Sum("montant"))
            .order_by("-montant")
        )

        return {
            "periode": periode.as_dict(),
            "paiements": {
                "nombre": nb_paiements,
                "montant": montant_paiements,
                "evolution": _evolution_paiements(),
            },
            "paiements_par_mode": [
                {
                    "mode": p["mode"],
                    "label": ModePaiement(p["mode"]).label,
                    "nombre": p["nombre"],
                    "montant": p["montant"],
                }
                for p in par_mode
            ],
            "retours": {
                "nombre": nb_retours,
                "montant": montant_retours,
                "evolution": _evolution_retours(),
                "frequence_jour": frequence_retours,
                "series": series_retours,
            },
            "annulations": {
                "nombre": nb_annulations,
                "evolution": _evolution_annulations(),
                "series": series_annulations,
            },
        }

    # ------------------------------------------------------------------
    # Analyse financière (§12) — strictement réservée au propriétaire
    # ------------------------------------------------------------------

    @staticmethod
    def analyse_financiere(structure_id, periode, filtres=None):
        filtres = filtres or {}
        ventes = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes = StatistiquesService._appliquer_filtre_vente(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_caisse(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_produit(
            ventes.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )

        ca_brut = StatistiquesService._ca_ventes(ventes, filtres)
        nb_ventes = ventes.count()

        retours = StatistiquesService._retours(structure_id, periode)
        montant_retours = (
            retours.aggregate(total=Sum("montant_total"))["total"] or 0
        )
        ca_net = ca_brut - montant_retours

        panier_moyen = round(ca_brut / nb_ventes, 2) if nb_ventes else 0

        lignes = LigneVente.objects.filter(vente__in=ventes)
        lignes = StatistiquesService._appliquer_filtre_produit(
            lignes, "medicament", filtres
        )
        nb_produits = lignes.aggregate(total=Sum("quantite"))["total"] or 0
        quantites_par_produit = {
            cle: {"quantite": quantite}
            for cle, quantite in lignes.values("medicament__id").annotate(
                quantite=Sum("quantite")
            ).values_list("medicament__id", "quantite")
        }

        derniers_prix_achat = {}
        for ligne in (
            LigneApprovisionnement.objects.filter(
                approvisionnement__structure_id=structure_id
            )
            .select_related("medicament")
            .order_by(
                "-approvisionnement__date_reception",
                "-approvisionnement__cree_le",
                "-id",
            )
        ):
            nom = ligne.medicament.nom
            if nom not in derniers_prix_achat:
                derniers_prix_achat[nom] = ligne.prix_achat

        medicament_par_id = {
            m.id: m
            for m in Medicament.objects.filter(
                id__in=list(quantites_par_produit.keys())
            )
        }

        cout_marchandises = 0
        for medicament_id, donnees in quantites_par_produit.items():
            medicament = medicament_par_id.get(medicament_id)
            if not medicament:
                continue
            prix_achat = derniers_prix_achat.get(medicament.nom)
            if prix_achat is not None:
                cout_marchandises += prix_achat * donnees["quantite"]
        cout_marchandises = round(cout_marchandises, 2)

        benefice_brut = round(ca_brut - cout_marchandises, 2)
        marge_pourcentage = (
            round(benefice_brut / ca_brut * 100, 2) if ca_brut else None
        )

        paiements = Paiement.objects.filter(
            vente__in=ventes
        ).values("mode").annotate(nombre=Count("id"), montant=Sum("montant"))
        par_mode = [
            {
                "mode": p["mode"],
                "label": ModePaiement(p["mode"]).label,
                "nombre": p["nombre"],
                "montant": p["montant"],
                "pourcentage": (
                    round(p["montant"] / ca_brut * 100, 2) if ca_brut else None
                ),
            }
            for p in paiements.order_by("-montant")
        ]

        return {
            "periode": periode.as_dict(),
            "chiffre_affaires": {
                "brut": ca_brut,
                "retours": montant_retours,
                "net": ca_net,
            },
            "nb_ventes_encaissees": nb_ventes,
            "nb_produits_vendus": nb_produits,
            "panier_moyen": panier_moyen,
            "cout_marchandises": cout_marchandises,
            "benefice_brut": benefice_brut,
            "marge_pourcentage": marge_pourcentage,
            "par_mode": par_mode,
        }

    # ------------------------------------------------------------------
    # Comparaison des périodes (§14)
    # ------------------------------------------------------------------

    @staticmethod
    def comparaison(structure_id, periode, filtres=None):
        filtres = filtres or {}
        precedent = periode.precedente
        if not precedent:
            return {
                "periode_actuelle": periode.as_dict(),
                "periode_precedente": None,
                "ventes": None,
                "approvisionnements": None,
                "ruptures": None,
                "retours_caisse": None,
            }

        ventes_actuel = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes_actuel = StatistiquesService._appliquer_filtre_vente(
            ventes_actuel, filtres
        )
        ventes_actuel = StatistiquesService._appliquer_filtre_caisse(
            ventes_actuel, filtres
        )
        ventes_actuel = StatistiquesService._appliquer_filtre_produit(
            ventes_actuel.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        ).count()
        ventes_precedent = StatistiquesService._ventes_validees(
            structure_id, precedent
        )
        ventes_precedent = StatistiquesService._appliquer_filtre_vente(
            ventes_precedent, filtres
        )
        ventes_precedent = StatistiquesService._appliquer_filtre_caisse(
            ventes_precedent, filtres
        )
        ventes_precedent = StatistiquesService._appliquer_filtre_produit(
            ventes_precedent.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        ).count()

        appros_actuel = StatistiquesService._approvisionnements(
            structure_id, periode
        )
        appros_actuel = StatistiquesService._appliquer_filtre_approvisionnement(
            appros_actuel, filtres
        )
        appros_actuel = StatistiquesService._appliquer_filtre_produit(
            appros_actuel.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        ).count()
        appros_precedent = StatistiquesService._approvisionnements(
            structure_id, precedent
        )
        appros_precedent = StatistiquesService._appliquer_filtre_approvisionnement(
            appros_precedent, filtres
        )
        appros_precedent = StatistiquesService._appliquer_filtre_produit(
            appros_precedent.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        ).count()

        ruptures_actuel = StatistiquesService._ruptures_alertes(
            structure_id,
            periode,
            filtres,
        )
        ruptures_precedent = StatistiquesService._ruptures_alertes(
            structure_id,
            precedent,
            filtres,
        )

        retours_actuel = StatistiquesService._retours(
            structure_id, periode
        )
        retours_actuel = StatistiquesService._appliquer_filtre_vente(
            retours_actuel,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("produit") or "").strip():
            retours_actuel = StatistiquesService._appliquer_filtre_produit(
                retours_actuel.filter(lignes__isnull=False).distinct(),
                "lignes__medicament",
                filtres,
            )
        retours_actuel = retours_actuel.count()
        retours_precedent = StatistiquesService._retours(
            structure_id, precedent
        )
        retours_precedent = StatistiquesService._appliquer_filtre_vente(
            retours_precedent,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("produit") or "").strip():
            retours_precedent = StatistiquesService._appliquer_filtre_produit(
                retours_precedent.filter(lignes__isnull=False).distinct(),
                "lignes__medicament",
                filtres,
            )
        retours_precedent = retours_precedent.count()

        return {
            "periode_actuelle": periode.as_dict(),
            "periode_precedente": precedent.as_dict(),
            "ventes": {
                "actuel": ventes_actuel,
                "precedent": ventes_precedent,
                "variation": _variation(ventes_actuel, ventes_precedent),
            },
            "approvisionnements": {
                "actuel": appros_actuel,
                "precedent": appros_precedent,
                "variation": _variation(appros_actuel, appros_precedent),
            },
            "ruptures": {
                "actuel": ruptures_actuel,
                "precedent": ruptures_precedent,
                "variation": _variation(ruptures_actuel, ruptures_precedent),
            },
            "retours_caisse": {
                "actuel": retours_actuel,
                "precedent": retours_precedent,
                "variation": _variation(retours_actuel, retours_precedent),
            },
        }

    # ------------------------------------------------------------------
    # Détails statistiques (§4 : consultation des détails)
    # ------------------------------------------------------------------

    @staticmethod
    def details(structure_id, periode, filtres=None):
        filtres = filtres or {}
        limite = 500

        ventes = StatistiquesService._ventes_validees(
            structure_id, periode
        )
        ventes = StatistiquesService._appliquer_filtre_vente(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_caisse(ventes, filtres)
        ventes = StatistiquesService._appliquer_filtre_produit(
            ventes.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        ventes = ventes.prefetch_related("paiement").order_by("-validee_le")
        total_ventes = ventes.count()

        appros = StatistiquesService._approvisionnements(
            structure_id, periode
        )
        appros = StatistiquesService._appliquer_filtre_approvisionnement(
            appros, filtres
        )
        appros = StatistiquesService._appliquer_filtre_produit(
            appros.filter(lignes__isnull=False).distinct(),
            "lignes__medicament",
            filtres,
        )
        appros = appros.order_by("-date_reception")
        total_appros = appros.count()

        retours = StatistiquesService._retours(
            structure_id, periode
        )
        retours = StatistiquesService._appliquer_filtre_vente(
            retours,
            filtres,
            champ_id="vente__id",
            champ_numero="vente__numero",
        )
        if (filtres.get("produit") or "").strip():
            retours = StatistiquesService._appliquer_filtre_produit(
                retours.filter(lignes__isnull=False).distinct(),
                "lignes__medicament",
                filtres,
            )
        mode = (filtres.get("caisse") or "").strip().upper()
        if mode in ModePaiement.values:
            retours = retours.filter(vente__paiement__mode=mode)
        retours = retours.order_by("-effectue_le")
        total_retours = retours.count()

        annulations = StatistiquesService._ventes_annulees(
            structure_id, periode
        )
        annulations = StatistiquesService._appliquer_filtre_vente(
            annulations, filtres
        ).order_by("-annulee_le")
        total_annulations = annulations.count()

        resume_appros = {}
        for ligne in LigneApprovisionnement.objects.filter(
            approvisionnement__in=list(appros[:limite])
        ):
            resume = resume_appros.setdefault(
                ligne.approvisionnement_id,
                {"quantite_totale": 0, "montant_total": 0},
            )
            resume["quantite_totale"] += ligne.quantite
            resume["montant_total"] += ligne.prix_achat * ligne.quantite

        return {
            "periode": periode.as_dict(),
            "ventes": {
                "total": total_ventes,
                "items": [
                    {
                        "id": v.id,
                        "numero": v.numero,
                        "validee_le": f"{v.validee_le:%d/%m/%Y}",
                        "heure": f"{v.validee_le:%H:%M}",
                        "montant_total": v.montant_total,
                        "nb_articles": v.nb_articles,
                        "mode_paiement": (
                            v.paiement.mode if hasattr(v, "paiement") else None
                        ),
                        "mode_label": (
                            ModePaiement(v.paiement.mode).label
                            if hasattr(v, "paiement")
                            else "—"
                        ),
                    }
                    for v in ventes[:limite]
                ],
            },
            "approvisionnements": {
                "total": total_appros,
                "items": [
                    {
                        "id": appro.id,
                        "numero": appro.numero,
                        "date_reception": f"{appro.date_reception:%d/%m/%Y}",
                        "fournisseur": appro.fournisseur,
                        "quantite_totale": resume_appros.get(
                            appro.id, {}
                        ).get("quantite_totale", 0),
                        "montant_total": resume_appros.get(
                            appro.id, {}
                        ).get("montant_total", 0),
                    }
                    for appro in appros[:limite]
                ],
            },
            "retours": {
                "total": total_retours,
                "items": [
                    {
                        "id": retour.id,
                        "numero": retour.numero,
                        "effectue_le": f"{retour.effectue_le:%d/%m/%Y}",
                        "heure": f"{retour.effectue_le:%H:%M}",
                        "motif": retour.motif,
                        "montant_total": retour.montant_total,
                        "nb_articles": retour.nb_articles,
                    }
                    for retour in retours[:limite]
                ],
            },
            "annulations": {
                "total": total_annulations,
                "items": [
                    {
                        "id": v.id,
                        "numero": v.numero,
                        "annulee_le": f"{v.annulee_le:%d/%m/%Y}",
                        "heure": f"{v.annulee_le:%H:%M}",
                        "motif_annulation": v.motif_annulation,
                    }
                    for v in annulations[:limite]
                ],
            },
        }

    # ------------------------------------------------------------------
    # Rapport complet (utilisé pour les exports)
    # ------------------------------------------------------------------

    @staticmethod
    def rapport_complet(structure_id, periode, filtres=None):
        return {
            "vue_generale": StatistiquesService.vue_generale(
                structure_id, periode, filtres
            ),
            "ventes": StatistiquesService.analyse_ventes(
                structure_id, periode, filtres
            ),
            "produits": StatistiquesService.produits_vendus(
                structure_id, periode, filtres
            ),
            "approvisionnements": StatistiquesService.analyse_approvisionnements(
                structure_id, periode, filtres
            ),
            "stock": StatistiquesService.analyse_stock(
                structure_id, filtres=filtres
            ),
            "caisse": StatistiquesService.analyse_caisse(
                structure_id, periode, filtres
            ),
            "financier": StatistiquesService.analyse_financiere(
                structure_id, periode, filtres
            ),
            "comparaison": StatistiquesService.comparaison(
                structure_id, periode, filtres
            ),
            "details": StatistiquesService.details(
                structure_id, periode, filtres
            ),
            "filtres": {
                "libelle": StatistiquesService._libelle_filtres(filtres),
                "actifs": StatistiquesService._filtres_actifs(filtres),
            },
        }
