"""Vues du module Statistiques (outil de pilotage du propriétaire).

Permissions :
- Propriétaire : accès complet en lecture (consultation, filtrage,
  comparaison des périodes, consultation des détails, export PDF/Excel).
- Gestionnaire : aucun accès.
- Caissier : aucun accès.

La sécurité est contrôlée au niveau du système : chaque vue impose
`proprietaire_required` puis vérifie que le propriétaire est bien
membre de la structure demandée. Les statistiques financières ne
peuvent jamais être récupérées en contournant l'interface.

Aucune de ces vues ne modifie, ne crée ni ne supprime de donnée : le
module Statistiques est strictement en lecture.
"""

from datetime import date
from io import BytesIO

from django.http import FileResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from structures.models import Structure
from structures.permissions import assert_proprietaire_owns_structure
from utilisateurs.decorators import proprietaire_required

from .exports import (
    generer_statistiques_excel,
    generer_statistiques_pdf,
)
from .services import StatistiquesService, resoudre_periode


def _parametres_statistiques(request):
    """Extrait et valide structure_id, la période et les filtres.

    Retourne `(resultat, None)` en cas de succès, `(None, Response)` en
    cas d'erreur (400 / 403).
    """
    structure_id = request.query_params.get("structure_id")
    if not structure_id:
        return None, Response(
            {"detail": "structure_id requis"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    assert_proprietaire_owns_structure(request.user, structure_id)
    structure = Structure.objects.get(id=structure_id)

    date_debut = date_fin = None
    for nom in ("date_debut", "date_fin"):
        brut = (request.query_params.get(nom) or "").strip()
        if not brut:
            continue
        try:
            valeur = date.fromisoformat(brut)
        except ValueError:
            return None, Response(
                {"detail": "Période invalide."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if nom == "date_debut":
            date_debut = valeur
        else:
            date_fin = valeur

    if date_debut and date_fin and date_debut > date_fin:
        return None, Response(
            {
                "detail": (
                    "La date de début doit être antérieure ou égale "
                    "à la date de fin."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    periode = resoudre_periode(
        request.query_params.get("periode"),
        date_debut=date_debut,
        date_fin=date_fin,
    )

    filtres = {
        "produit": (request.query_params.get("produit") or "").strip(),
        "type": (request.query_params.get("type") or "").strip(),
        "vente": (request.query_params.get("vente") or "").strip(),
        "approvisionnement": (
            request.query_params.get("approvisionnement") or ""
        ).strip(),
        "caisse": (request.query_params.get("caisse") or "").strip(),
    }

    return (structure, periode, filtres), None


class VueGeneraleView(APIView):
    """§4 — Vue générale : vision synthétique de l'activité."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.vue_generale(
                structure.id, periode, filtres
            )
        )


class AnalyseVentesView(APIView):
    """§5 — Analyse des ventes : évolution et périodes d'activité."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.analyse_ventes(
                structure.id, periode, filtres
            )
        )


class ProduitsVendusView(APIView):
    """§6 et §7 — Produits les plus et les moins vendus."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.produits_vendus(
                structure.id, periode, filtres
            )
        )


class AnalyseApprovisionnementsView(APIView):
    """§8 — Analyse des approvisionnements."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.analyse_approvisionnements(
                structure.id, periode, filtres
            )
        )


class AnalyseStockView(APIView):
    """§9 et §13 — Analyse du stock et valeur du stock."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.analyse_stock(
                structure.id, filtres=filtres
            )
        )


class AnalyseCaisseView(APIView):
    """§10 et §11 — Analyse des retours caisse et des annulations."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.analyse_caisse(
                structure.id, periode, filtres
            )
        )


class AnalyseFinanciereView(APIView):
    """§12 — Analyse financière (strictement réservée au propriétaire)."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.analyse_financiere(
                structure.id, periode, filtres
            )
        )


class ComparaisonPeriodesView(APIView):
    """§14 — Comparaison de la période avec la période précédente."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.comparaison(
                structure.id, periode, filtres
            )
        )


class DetailsStatistiquesView(APIView):
    """§4 — Consultation des détails statistiques (ventes, appros, retours)."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat
        return Response(
            StatistiquesService.details(
                structure.id, periode, filtres
            )
        )


class StatistiquesPDFView(APIView):
    """§16 — Export PDF du rapport statistique (réservé au propriétaire)."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat

        rapport = StatistiquesService.rapport_complet(
            structure.id, periode, filtres
        )
        pdf = BytesIO(generer_statistiques_pdf(structure, rapport))
        nom = f"statistiques_{structure.nom}.pdf".replace(" ", "_")
        return FileResponse(
            pdf,
            as_attachment=True,
            filename=nom,
            content_type="application/pdf",
        )


class StatistiquesExcelView(APIView):
    """§16 — Export Excel du rapport statistique (réservé au propriétaire)."""

    @proprietaire_required
    def get(self, request):
        resultat, erreur = _parametres_statistiques(request)
        if erreur:
            return erreur
        structure, periode, filtres = resultat

        rapport = StatistiquesService.rapport_complet(
            structure.id, periode, filtres
        )
        excel = BytesIO(generer_statistiques_excel(structure, rapport))
        nom = f"statistiques_{structure.nom}.xlsx".replace(" ", "_")
        return FileResponse(
            excel,
            as_attachment=True,
            filename=nom,
            content_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
        )
