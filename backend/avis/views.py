from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class AvisDisabledView(APIView):
    """
    Module avis désactivé.
    Utilisez l'application feedback pour donner votre avis.
    """

    def get(self, request, *args, **kwargs):
        return Response(
            {"detail": "Ce module est désactivé. Utilisez l'application feedback."},
            status=status.HTTP_404_NOT_FOUND,
        )

    def post(self, request, *args, **kwargs):
        return Response(
            {"detail": "Ce module est désactivé. Utilisez l'application feedback."},
            status=status.HTTP_404_NOT_FOUND,
        )

    def patch(self, request, *args, **kwargs):
        return Response(
            {"detail": "Ce module est désactivé. Utilisez l'application feedback."},
            status=status.HTTP_404_NOT_FOUND,
        )

    def delete(self, request, *args, **kwargs):
        return Response(
            {"detail": "Ce module est désactivé. Utilisez l'application feedback."},
            status=status.HTTP_404_NOT_FOUND,
        )


CreateAvisView = AvisDisabledView
UpdateAvisView = AvisDisabledView
DeleteAvisView = AvisDisabledView
ListAvisStructureView = AvisDisabledView
AddCommentaireView = AvisDisabledView
UpdateCommentaireView = AvisDisabledView
DeleteCommentaireView = AvisDisabledView
