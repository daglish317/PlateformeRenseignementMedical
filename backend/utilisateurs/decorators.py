from functools import wraps
from rest_framework.response import Response
from rest_framework import status


def admin_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifié"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != "ADMINISTRATEUR":
            return Response(
                {"detail": "Accès refusé (admin uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view


def gestionnaire_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifié"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != "GESTIONNAIRE":
            return Response(
                {"detail": "Accès refusé (gestionnaire uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view


def patient_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifié"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != "PATIENT":
            return Response(
                {"detail": "Accès refusé (patient uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view