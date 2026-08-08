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


def proprietaire_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifie"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != "PROPRIETAIRE":
            return Response(
                {"detail": "Acces refuse (proprietaire uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view


def responsable_structure_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifie"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role not in {"PROPRIETAIRE", "GESTIONNAIRE"}:
            return Response(
                {"detail": "Acces refuse (responsable de structure uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view


def caissier_required(view_func):
    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifie"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role != "CAISSIER":
            return Response(
                {"detail": "Acces refuse (caissier uniquement)"},
                status=status.HTTP_403_FORBIDDEN
            )

        return view_func(self, request, *args, **kwargs)

    return _wrapped_view


def caissier_ou_proprietaire_required(view_func):
    """Lecture seule du module Caisse : caissier ou proprietaire.

    Le proprietaire peut consulter les ventes, paiements, retours et
    historiques, sans pouvoir modifier les operations realisees.
    """

    @wraps(view_func)
    def _wrapped_view(self, request, *args, **kwargs):

        if not request.user.is_authenticated:
            return Response(
                {"detail": "Non authentifie"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        if request.user.role not in {"CAISSIER", "PROPRIETAIRE"}:
            return Response(
                {"detail": "Acces refuse (caissier ou proprietaire uniquement)"},
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
