from rest_framework.exceptions import PermissionDenied

from structures.models import Structure


def assert_gestionnaire_owns_structure(user, structure_id):
    if user.role != "GESTIONNAIRE":
        raise PermissionDenied("Accès réservé aux gestionnaires.")
    if not Structure.objects.filter(
        id=structure_id, gestionnaire=user, est_supprimee=False
    ).exists():
        raise PermissionDenied("Vous ne gérez pas cette structure.")


def get_user_structure(user):
    return Structure.objects.filter(
        gestionnaire=user, est_supprimee=False
    ).first()
