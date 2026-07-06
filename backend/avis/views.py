from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import AvisStructure, CommentaireAvis
from structures.models import Structure

from .serializers import (
    AvisSerializer,
    AvisCreateSerializer,
    CommentaireCreateSerializer,
)
from .services import AvisService
from utilisateurs.decorators import patient_required, admin_required


class CreateAvisView(APIView):

    @patient_required
    def post(self, request):

        serializer = AvisCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        structure = Structure.objects.get(id=serializer.validated_data["structure_id"])

        avis = AvisService.creer_ou_get_avis(
            utilisateur=request.user,
            structure=structure,
            note=serializer.validated_data["note"],
        )

        return Response(AvisSerializer(avis).data, status=status.HTTP_201_CREATED)


class AddCommentaireView(APIView):

    @patient_required
    def post(self, request):

        serializer = CommentaireCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        avis = AvisStructure.objects.get(
            id=serializer.validated_data["avis_id"],
            utilisateur=request.user,
        )

        commentaire = AvisService.ajouter_commentaire(
            avis=avis,
            contenu=serializer.validated_data["contenu"],
        )

        return Response(
            {"id": commentaire.id, "contenu": commentaire.contenu},
            status=status.HTTP_201_CREATED,
        )


class UpdateCommentaireView(APIView):

    @patient_required
    def patch(self, request, pk):

        commentaire = CommentaireAvis.objects.select_related("avis").get(
            id=pk,
            avis__utilisateur=request.user,
        )

        commentaire = AvisService.modifier_commentaire(
            commentaire=commentaire,
            contenu=request.data.get("contenu"),
        )

        return Response({"id": commentaire.id, "contenu": commentaire.contenu})


class DeleteCommentaireView(APIView):

    @admin_required
    def delete(self, request, pk):

        commentaire = CommentaireAvis.objects.get(id=pk)
        AvisService.supprimer_commentaire(commentaire=commentaire)
        return Response(status=status.HTTP_204_NO_CONTENT)
