from rest_framework.exceptions import PermissionDenied

from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    TypeStructure,
)
from structures.permission_service import (
    assert_action_permission,
    assert_module_access,
    assert_operational_member,
    get_active_membership,
    user_has_action,
    user_has_module_access,
)


STRUCTURE_ADMIN_ROLES = {
    RoleEquipeStructure.PROPRIETAIRE,
    RoleEquipeStructure.GESTIONNAIRE,
}


def assert_user_has_structure_role(user, structure_id, allowed_roles):
    if not user.is_authenticated:
        raise PermissionDenied("Authentification requise.")

    if user.role == "ADMINISTRATEUR":
        return

    if not EquipeStructure.objects.filter(
        structure_id=structure_id,
        utilisateur=user,
        role__in=allowed_roles,
        statut=StatutEquipeStructure.ACTIF,
        structure__est_supprimee=False,
    ).exists():
        raise PermissionDenied("Vous n'avez pas acces a cette structure.")


def assert_gestionnaire_owns_structure(user, structure_id):
    """Verifie l'appartenance a la structure (proprietaire ou gestionnaire actif)."""
    if user.role == "ADMINISTRATEUR":
        return
    if user.role == "PROPRIETAIRE":
        assert_user_has_structure_role(user, structure_id, {RoleEquipeStructure.PROPRIETAIRE})
        return
    if user.role == "GESTIONNAIRE":
        assert_user_has_structure_role(user, structure_id, {RoleEquipeStructure.GESTIONNAIRE})
        return
    raise PermissionDenied("Acces reserve aux responsables de structure.")


def assert_operational_access(user, structure_id, module=None, action=None):
    """Verifie l'acces operationnel base sur les permissions granulaires."""
    if module and action:
        assert_action_permission(user, structure_id, module, action)
        return
    if module:
        assert_module_access(user, structure_id, module)
        return
    assert_operational_member(user, structure_id)


def assert_structure_autorise_stock_direct(user, structure_id):
    """Bloque l'augmentation directe du stock pour les pharmacies.

    Seul un approvisionnement valide permet d'augmenter le stock d'une
    pharmacie. Les hopitaux conservent leur gestion de stock directe.
    """
    if Structure.objects.filter(
        id=structure_id,
        type=TypeStructure.PHARMACIE,
    ).exists():
        raise PermissionDenied(
            "Pour une pharmacie, le stock ne peut etre augmente que par "
            "l'approvisionnement."
        )


def assert_proprietaire_owns_structure(user, structure_id):
    if user.role != "PROPRIETAIRE":
        raise PermissionDenied("Acces reserve au proprietaire.")
    assert_user_has_structure_role(user, structure_id, {RoleEquipeStructure.PROPRIETAIRE})


def assert_caissier_works_in_structure(user, structure_id):
    if user.role == "PROPRIETAIRE":
        assert_proprietaire_owns_structure(user, structure_id)
        return
    if user.role != "CAISSIER":
        raise PermissionDenied("Acces reserve aux caissiers.")
    assert_user_has_structure_role(user, structure_id, {RoleEquipeStructure.CAISSIER})


def get_user_structure_membership(user):
    return (
        EquipeStructure.objects.filter(
            utilisateur=user,
            statut=StatutEquipeStructure.ACTIF,
            structure__est_supprimee=False,
        )
        .select_related("structure")
        .first()
    )


def get_user_structure(user):
    membership = get_user_structure_membership(user)
    if membership:
        return membership.structure

    # Compatibilite temporaire avec l'ancien lien direct.
    return Structure.objects.filter(
        gestionnaire=user,
        est_supprimee=False,
    ).first()


def get_structure_caissiers(structure):
    """Retourne la liste des caissiers ACTIFS de la structure."""
    membres = (
        EquipeStructure.objects.filter(
            structure=structure,
            role=RoleEquipeStructure.CAISSIER,
            statut=StatutEquipeStructure.ACTIF,
        )
        .select_related("utilisateur")
    )
    return [membre.utilisateur for membre in membres if membre.utilisateur.is_active]


def get_structure_responsables(structure):
    """Retourne la liste dedoublonnee des responsables de la structure.

    Responsables = membres ACTIFS de l'equipe avec le role PROPRIETAIRE ou
    GESTIONNAIRE, plus le gestionnaire historique (lien direct) s'il existe.
    """
    from django.db.models import Q

    membres = list(
        EquipeStructure.objects.filter(
            structure=structure,
            role__in=STRUCTURE_ADMIN_ROLES,
            statut=StatutEquipeStructure.ACTIF,
        ).select_related("utilisateur")
    )

    responsables = {membre.utilisateur for membre in membres}

    if structure.gestionnaire_id:
        responsables.add(structure.gestionnaire)

    return [u for u in responsables if u and u.is_active]


def get_structure_proprietaires(structure):
    """Retourne la liste des proprietaires actifs d'une structure."""
    membres = (
        EquipeStructure.objects.filter(
            structure=structure,
            role=RoleEquipeStructure.PROPRIETAIRE,
            statut=StatutEquipeStructure.ACTIF,
        )
        .select_related("utilisateur")
    )
    return [membre.utilisateur for membre in membres if membre.utilisateur.is_active]
