from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Catalogue
from .serializers import CatalogueSerializer, CatalogueCreateUpdateSerializer
from .services import CatalogueService
from .permissions import IsAdminCatalogue
from .filters import CatalogueFilter
from search.utils.fuzzy import suggest


class CatalogueListView(APIView):

    def get(self, request):

        queryset = Catalogue.objects.all()
        filterset = CatalogueFilter(request.query_params, queryset=queryset)
        catalogues = filterset.qs.order_by("type", "nom")

        nom = request.query_params.get("nom")
        fuzzy = request.query_params.get("fuzzy", "false").lower() == "true"
        if nom and fuzzy:
            catalogues = suggest(nom, limit=20)

        serializer = CatalogueSerializer(catalogues, many=True)
        return Response(serializer.data)


class CatalogueDetailView(APIView):

    def get(self, request, pk):

        catalogue = CatalogueService.obtenir_par_id(pk)
        if catalogue is None:
            return Response({"detail": "Élément introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CatalogueSerializer(catalogue).data)


class CatalogueCreateView(APIView):
    permission_classes = [IsAdminCatalogue]

    def post(self, request):

        serializer = CatalogueCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        catalogue = CatalogueService.creer(donnees=serializer.validated_data)
        return Response(
            {"message": "Élément créé avec succès.", "data": CatalogueSerializer(catalogue).data},
            status=status.HTTP_201_CREATED,
        )


class CatalogueUpdateView(APIView):
    permission_classes = [IsAdminCatalogue]

    def put(self, request, pk):

        catalogue = CatalogueService.obtenir_par_id(pk)
        if catalogue is None:
            return Response({"detail": "Élément introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = CatalogueCreateUpdateSerializer(catalogue, data=request.data)
        serializer.is_valid(raise_exception=True)
        catalogue = CatalogueService.modifier(catalogue=catalogue, donnees=serializer.validated_data)
        return Response({"message": "Élément modifié.", "data": CatalogueSerializer(catalogue).data})


class CatalogueDeleteView(APIView):
    permission_classes = [IsAdminCatalogue]

    def delete(self, request, pk):

        catalogue = CatalogueService.obtenir_par_id(pk)
        if catalogue is None:
            return Response({"detail": "Élément introuvable."}, status=status.HTTP_404_NOT_FOUND)

        CatalogueService.supprimer(catalogue=catalogue)
        return Response({"message": "Élément supprimé."}, status=status.HTTP_200_OK)


class CatalogueDesactiverView(APIView):
    permission_classes = [IsAdminCatalogue]

    def patch(self, request, pk):

        catalogue = CatalogueService.obtenir_par_id(pk)
        if catalogue is None:
            return Response({"detail": "Élément introuvable."}, status=status.HTTP_404_NOT_FOUND)
        CatalogueService.desactiver(catalogue)
        return Response({"message": "Élément désactivé."})


class CatalogueActiverView(APIView):
    permission_classes = [IsAdminCatalogue]

    def patch(self, request, pk):

        catalogue = CatalogueService.obtenir_par_id(pk)
        if catalogue is None:
            return Response({"detail": "Élément introuvable."}, status=status.HTTP_404_NOT_FOUND)
        CatalogueService.activer(catalogue)
        return Response({"message": "Élément activé."})
