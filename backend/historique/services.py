"""Service d'enregistrement des événements du module Historique.

Le module Historique est un journal passif : il ne crée lui-même aucun
événement. Il reçoit automatiquement les traces générées par les modules
Approvisionnement, Inventaire et Caisse (retour caisse).
"""

from .models import EvenementHistorique, TypeEvenementHistorique


class HistoriqueService:
    """Enregistre les traces permanentes du journal (en lecture seule)."""

    @staticmethod
    def _texte_recherche(type_evenement, utilisateur, donnees):
        """Construit l'index de recherche en minuscules.

        Couvre les critères de la spécification : type d'événement, nom
        d'un médicament, numéro d'un approvisionnement, numéro d'une
        facture (retour caisse) et nom de l'utilisateur.
        """
        morceaux = [
            type_evenement,
            str(type_evenement).replace("_", " "),
            utilisateur.nom,
            utilisateur.role or "",
        ]
        donnees = donnees or {}

        for cle in ("numero", "numero_retour", "numero_vente", "numero_facture"):
            valeur = donnees.get(cle)
            if valeur:
                morceaux.append(str(valeur))

        for cle in ("reference_bon", "fournisseur", "motif", "commentaire"):
            valeur = donnees.get(cle)
            if valeur:
                morceaux.append(str(valeur))

        for medicament in donnees.get("medicaments") or []:
            nom = medicament.get("nom")
            if nom:
                morceaux.append(str(nom))

        return " ".join(
            morceau for morceau in morceaux if morceau is not None
        ).lower()

    @staticmethod
    def enregistrer(*, structure, type_evenement, utilisateur, donnees=None):
        """Crée la trace permanente d'un événement métier important."""
        return EvenementHistorique.objects.create(
            structure=structure,
            type=type_evenement,
            utilisateur=utilisateur,
            role=utilisateur.role or "",
            donnees=donnees or {},
            texte_recherche=HistoriqueService._texte_recherche(
                TypeEvenementHistorique(type_evenement).label,
                utilisateur,
                donnees,
            ),
        )
