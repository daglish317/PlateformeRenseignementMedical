from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import StockItem, StockMovement
from .serializers import StockSerializer, StockMovementSerializer
from .services import StockService

from structures.models import Structure
from structures.permissions import assert_gestionnaire_owns_structure
from utilisateurs.decorators import gestionnaire_required


class CreateStockView(APIView):

    @gestionnaire_required
    def post(self, request):

        structure_id = request.data.get("structure_id")
        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        item = StockService.ajouter_ou_mettre_a_jour(
            structure=structure,
            nom=request.data.get("nom"),
            type_item=request.data.get("type_item"),
            quantite=request.data.get("quantite", 0),
            disponible=request.data.get("disponible", True),
            seuil_alerte=request.data.get("seuil_alerte", 5),
        )

        return Response(StockSerializer(item).data, status=status.HTTP_201_CREATED)


class ListStockStructureView(APIView):

    def get(self, request, structure_id):

        items = StockItem.objects.filter(structure_id=structure_id)
        return Response(StockSerializer(items, many=True).data)


class DeleteStockView(APIView):

    @gestionnaire_required
    def delete(self, request, pk):

        try:
            item = StockItem.objects.select_related("structure").get(id=pk)
        except StockItem.DoesNotExist:
            return Response(
                {"detail": "Article introuvable"},
                status=status.HTTP_404_NOT_FOUND,
            )

        assert_gestionnaire_owns_structure(request.user, item.structure_id)

        StockService.supprimer_item(item=item)

        return Response(
            {"message": "Article supprimé"},
            status=status.HTTP_200_OK,
        )


class RetirerStockView(APIView):

    @gestionnaire_required
    def post(self, request, pk):

        item = StockItem.objects.select_related("structure").get(id=pk)
        assert_gestionnaire_owns_structure(request.user, item.structure_id)

        try:
            item = StockService.retirer_stock(
                item=item,
                quantite=int(request.data.get("quantite", 0)),
                motif=request.data.get("motif", ""),
            )
        except ValueError as e:
            return Response({"detail": str(e)}, status=400)

        return Response(StockSerializer(item).data)


class EntreeStockView(APIView):

    @gestionnaire_required
    def post(self, request, pk):

        item = StockItem.objects.select_related("structure").get(id=pk)
        assert_gestionnaire_owns_structure(request.user, item.structure_id)

        item = StockService.entree_stock(
            item=item,
            quantite=int(request.data.get("quantite", 0)),
            motif=request.data.get("motif", ""),
        )
        return Response(StockSerializer(item).data)


class StockMovementsView(APIView):

    @gestionnaire_required
    def get(self, request, pk):

        item = StockItem.objects.select_related("structure").get(id=pk)
        assert_gestionnaire_owns_structure(request.user, item.structure_id)
        mouvements = StockMovement.objects.filter(item=item)
        return Response(StockMovementSerializer(mouvements, many=True).data)


class StockAlertesView(APIView):

    @gestionnaire_required
    def get(self, request, structure_id):

        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)
        items = StockService.items_en_alerte(structure)
        return Response(StockSerializer(items, many=True).data)
