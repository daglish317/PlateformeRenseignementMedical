from rest_framework.exceptions import PermissionDenied

from structures.models import (
    EquipeStructure,
    RoleEquipeStructure,
    StatutEquipeStructure,
    Structure,
    TypeStructure,
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
    if user.role not in {"PROPRIETAIRE", "GESTIONNAIRE"}:
        raise PermissionDenied("Acces reserve aux responsables de structure.")
    assert_user_has_structure_role(user, structure_id, STRUCTURE_ADMIN_ROLES)


def assert_structure_autorise_stock_direct(user, structure_id):
    """Bloque l'augmentation directe du stock pour les pharmacies.

    Seul un approvisionnement valide permet d'augmenter le stock d'une
    pharmacie. Les hopitaux conservent leur gestion de stock directe.
    """
    assert_gestionnaire_owns_structure(user, structure_id)
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
