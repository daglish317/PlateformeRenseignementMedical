"""Service de gestion et de verification des permissions operationnelles."""

from rest_framework.exceptions import PermissionDenied

from .models import EquipeStructure, MembrePermission, StatutEquipeStructure
from .permission_registry import (
    ATTRIBUTABLE_MODULES,
    MODULE_ACTIONS,
    ActionPermission,
    ModuleOperationnel,
    module_has_action,
)


def get_active_membership(user, structure_id):
    return (
        EquipeStructure.objects.filter(
            utilisateur=user,
            structure_id=structure_id,
            statut=StatutEquipeStructure.ACTIF,
            structure__est_supprimee=False,
        )
        .select_related("structure")
        .first()
    )


def user_is_proprietaire_of(user, structure_id):
    return EquipeStructure.objects.filter(
        utilisateur=user,
        structure_id=structure_id,
        role="PROPRIETAIRE",
        statut=StatutEquipeStructure.ACTIF,
        structure__est_supprimee=False,
    ).exists()


def user_has_full_structure_access(user, structure_id):
    if user.role == "ADMINISTRATEUR":
        return True
    if user.role == "PROPRIETAIRE" and user_is_proprietaire_of(user, structure_id):
        return True
    return False


def get_member_permissions_map(membership):
    """Retourne {module: [actions]} pour un membre d'equipe."""
    permissions = MembrePermission.objects.filter(equipe=membership)
    result = {module.value: [] for module in ATTRIBUTABLE_MODULES}
    for perm in permissions:
        result.setdefault(perm.module, []).append(perm.action)
    return result


def member_has_module_access(membership, module):
    return MembrePermission.objects.filter(
        equipe=membership,
        module=module,
    ).exists()


def member_has_action(membership, module, action):
    if not module_has_action(module, action):
        return False
    return MembrePermission.objects.filter(
        equipe=membership,
        module=module,
        action=action,
    ).exists()


def user_has_module_access(user, structure_id, module):
    if user_has_full_structure_access(user, structure_id):
        return True
    membership = get_active_membership(user, structure_id)
    if not membership:
        return False
    return member_has_module_access(membership, module)


def user_has_action(user, structure_id, module, action):
    if user_has_full_structure_access(user, structure_id):
        return True
    membership = get_active_membership(user, structure_id)
    if not membership:
        return False
    return member_has_action(membership, module, action)


def assert_module_access(user, structure_id, module):
    if user_has_module_access(user, structure_id, module):
        return
    raise PermissionDenied(
        f"Acces refuse au module {module} pour cette structure."
    )


def assert_action_permission(user, structure_id, module, action):
    if user_has_action(user, structure_id, module, action):
        return
    raise PermissionDenied(
        f"Action {action} refusee sur le module {module}."
    )


def assert_operational_member(user, structure_id):
    if user_has_full_structure_access(user, structure_id):
        return get_active_membership(user, structure_id)
    membership = get_active_membership(user, structure_id)
    if not membership:
        raise PermissionDenied("Vous n'avez pas acces a cette structure.")
    if user.role not in {"GESTIONNAIRE", "CAISSIER"}:
        raise PermissionDenied("Acces reserve aux membres operationnels.")
    return membership


def replace_member_permissions(membership, permissions_payload):
    """Remplace toutes les permissions d'un membre.

    permissions_payload: {module: [action, ...], ...}
    """
    MembrePermission.objects.filter(equipe=membership).delete()
    to_create = []
    for module, actions in permissions_payload.items():
        if module not in {m.value for m in ATTRIBUTABLE_MODULES}:
            continue
        for action in actions:
            if not module_has_action(module, action):
                continue
            to_create.append(
                MembrePermission(
                    equipe=membership,
                    module=module,
                    action=action,
                )
            )
    if to_create:
        MembrePermission.objects.bulk_create(to_create)


def get_user_permissions_response(user, structure_id):
    if user_has_full_structure_access(user, structure_id):
        return {
            "structure_id": str(structure_id),
            "full_access": True,
            "modules": {
                module.value: [action.value for action in actions]
                for module, actions in MODULE_ACTIONS.items()
            },
        }

    membership = get_active_membership(user, structure_id)
    if not membership:
        return {
            "structure_id": str(structure_id),
            "full_access": False,
            "modules": {},
        }

    return {
        "structure_id": str(structure_id),
        "full_access": False,
        "modules": get_member_permissions_map(membership),
    }


def validate_permissions_payload(payload):
    """Valide et normalise le payload de permissions."""
    if not isinstance(payload, dict):
        raise ValueError("Format de permissions invalide.")

    normalized = {}
    for module, actions in payload.items():
        if module not in {m.value for m in ATTRIBUTABLE_MODULES}:
            continue
        if not isinstance(actions, list):
            continue
        valid_actions = []
        for action in actions:
            if module_has_action(module, action):
                valid_actions.append(action)
        if valid_actions:
            normalized[module] = list(dict.fromkeys(valid_actions))
    return normalized


def default_empty_permissions():
    return {module.value: [] for module in ATTRIBUTABLE_MODULES}
