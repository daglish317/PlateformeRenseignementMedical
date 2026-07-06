from rest_framework.permissions import BasePermission


class IsAdminCatalogue(BasePermission):
    """
    Autorise uniquement les administrateurs
    à gérer le catalogue.
    """

    message = "Vous n'avez pas les autorisations nécessaires."

    def has_permission(self, request, view):

        user = request.user

        return (
            user.is_authenticated
            and getattr(user, "role", None) == "ADMINISTRATEUR"
        )