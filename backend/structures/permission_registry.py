"""Registre central des modules operationnels et de leurs actions.

Le module MESSAGERIE n'est pas attribuable aux membres operationnels.
"""

from django.db import models


class ModuleOperationnel(models.TextChoices):
    APPROVISIONNEMENT = "APPROVISIONNEMENT", "Approvisionnement"
    STOCK = "STOCK", "Stock"
    VENTE = "VENTE", "Vente"
    CAISSE = "CAISSE", "Caisse"
    FACTURE = "FACTURE", "Facture"
    SERVICES_MEDICAUX = "SERVICES_MEDICAUX", "Services medicaux"
    PLATEAUX_TECHNIQUES = "PLATEAUX_TECHNIQUES", "Plateaux techniques"
    PRISES_EN_CHARGE = "PRISES_EN_CHARGE", "Prises en charge"
    INVENTAIRE = "INVENTAIRE", "Inventaire"
    ALERTES = "ALERTES", "Alertes"
    PEREMPTION = "PEREMPTION", "Peremption"
    HISTORIQUE = "HISTORIQUE", "Historique"
    STATISTIQUES = "STATISTIQUES", "Statistiques"
    HORAIRES = "HORAIRES", "Horaires"
    NOTIFICATIONS = "NOTIFICATIONS", "Notifications"
    PROFIL = "PROFIL", "Profil"
    PARAMETRES = "PARAMETRES", "Parametres"


class ActionPermission(models.TextChoices):
    CONSULTER = "CONSULTER", "Consulter"
    CREER = "CREER", "Creer"
    MODIFIER = "MODIFIER", "Modifier"
    SUPPRIMER = "SUPPRIMER", "Supprimer"
    EXPORTER = "EXPORTER", "Exporter"
    IMPRIMER = "IMPRIMER", "Imprimer"
    FILTRER = "FILTRER", "Filtrer"
    RECHERCHER = "RECHERCHER", "Rechercher"
    ANNULER = "ANNULER", "Annuler"
    VALIDER_PAIEMENT = "VALIDER_PAIEMENT", "Valider paiement"
    REFUSER_PAIEMENT = "REFUSER_PAIEMENT", "Refuser paiement"
    IMPRIMER_RECU = "IMPRIMER_RECU", "Imprimer recu"
    RETOUR_CAISSE = "RETOUR_CAISSE", "Retour en caisse"


MODULE_ACTIONS = {
    ModuleOperationnel.APPROVISIONNEMENT: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.MODIFIER,
        ActionPermission.SUPPRIMER,
        ActionPermission.EXPORTER,
        ActionPermission.IMPRIMER,
    ],
    ModuleOperationnel.STOCK: [
        ActionPermission.CONSULTER,
        ActionPermission.FILTRER,
        ActionPermission.RECHERCHER,
        ActionPermission.MODIFIER,
        ActionPermission.SUPPRIMER,
        ActionPermission.EXPORTER,
        ActionPermission.IMPRIMER,
    ],
    ModuleOperationnel.VENTE: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.MODIFIER,
        ActionPermission.ANNULER,
        ActionPermission.EXPORTER,
        ActionPermission.IMPRIMER,
    ],
    ModuleOperationnel.CAISSE: [
        ActionPermission.CONSULTER,
        ActionPermission.VALIDER_PAIEMENT,
        ActionPermission.REFUSER_PAIEMENT,
        ActionPermission.IMPRIMER_RECU,
        ActionPermission.RETOUR_CAISSE,
        ActionPermission.SUPPRIMER,
    ],
    ModuleOperationnel.FACTURE: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.IMPRIMER,
        ActionPermission.RECHERCHER,
        ActionPermission.FILTRER,
        ActionPermission.EXPORTER,
    ],
    ModuleOperationnel.SERVICES_MEDICAUX: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.MODIFIER,
        ActionPermission.SUPPRIMER,
    ],
    ModuleOperationnel.PLATEAUX_TECHNIQUES: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.MODIFIER,
        ActionPermission.SUPPRIMER,
    ],
    ModuleOperationnel.PRISES_EN_CHARGE: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.MODIFIER,
        ActionPermission.SUPPRIMER,
    ],
    ModuleOperationnel.INVENTAIRE: [
        ActionPermission.CONSULTER,
        ActionPermission.CREER,
        ActionPermission.EXPORTER,
        ActionPermission.IMPRIMER,
    ],
    ModuleOperationnel.ALERTES: [
        ActionPermission.CONSULTER,
        ActionPermission.FILTRER,
        ActionPermission.RECHERCHER,
        ActionPermission.MODIFIER,
        ActionPermission.EXPORTER,
    ],
    ModuleOperationnel.PEREMPTION: [
        ActionPermission.CONSULTER,
        ActionPermission.FILTRER,
        ActionPermission.RECHERCHER,
        ActionPermission.EXPORTER,
    ],
    ModuleOperationnel.HISTORIQUE: [
        ActionPermission.CONSULTER,
        ActionPermission.FILTRER,
        ActionPermission.RECHERCHER,
        ActionPermission.EXPORTER,
    ],
    ModuleOperationnel.STATISTIQUES: [
        ActionPermission.CONSULTER,
        ActionPermission.EXPORTER,
        ActionPermission.IMPRIMER,
    ],
    ModuleOperationnel.HORAIRES: [
        ActionPermission.CONSULTER,
        ActionPermission.MODIFIER,
    ],
    ModuleOperationnel.NOTIFICATIONS: [
        ActionPermission.CONSULTER,
    ],
    ModuleOperationnel.PROFIL: [
        ActionPermission.CONSULTER,
        ActionPermission.MODIFIER,
    ],
    ModuleOperationnel.PARAMETRES: [
        ActionPermission.CONSULTER,
        ActionPermission.MODIFIER,
    ],
}

ATTRIBUTABLE_MODULES = list(MODULE_ACTIONS.keys())


def module_has_action(module, action):
    return action in MODULE_ACTIONS.get(module, [])


def serialize_permission_registry():
    return {
        module.value: [action.value for action in actions]
        for module, actions in MODULE_ACTIONS.items()
    }
