import csv
import io

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import StockItem, StockMovement
from .serializers import StockSerializer, StockMovementSerializer
from .services import StockService

from structures.models import Structure
from structures.permissions import assert_gestionnaire_owns_structure
from utilisateurs.decorators import gestionnaire_required


def _parse_csv(file):
    decoded = file.read().decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    rows = []
    for row in reader:
        rows.append(dict(row))
    return rows


def _parse_excel(file):
    try:
        import openpyxl
    except ImportError:
        return None

    wb = openpyxl.load_workbook(file, read_only=True, data_only=True)
    ws = wb.active
    rows = []
    headers = [str(cell.value).strip().lower() if cell.value else "" for cell in next(ws.iter_rows(min_row=1, max_row=1))]

    for row in ws.iter_rows(min_row=2, values_only=True):
        row_dict = {}
        for header, value in zip(headers, row):
            if header:
                row_dict[header] = str(value) if value is not None else ""
        rows.append(row_dict)

    wb.close()
    return rows


class CreateStockView(APIView):

    @gestionnaire_required
    def post(self, request):

        structure_id = request.data.get("structure_id")
        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        nom = request.data.get("nom")
        if not nom:
            return Response({"detail": "Nom manquant"}, status=status.HTTP_400_BAD_REQUEST)

        quantite_raw = request.data.get("quantite", 0)
        try:
            quantite = int(float(quantite_raw))
        except (ValueError, TypeError):
            quantite = 0

        item = StockService.ajouter_ou_mettre_a_jour(
            structure=structure,
            nom=nom,
            type_item=request.data.get("type_item", "MEDICAMENT"),
            quantite=quantite,
            disponible=request.data.get("disponible", True),
            seuil_alerte=int(request.data.get("seuil_alerte", 5)),
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


class ImportMedicamentView(APIView):

    @gestionnaire_required
    def post(self, request):
        structure_id = request.data.get("structure_id")
        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "Aucun fichier fourni"}, status=status.HTTP_400_BAD_REQUEST)

        filename = file.name.lower()
        if filename.endswith(".csv"):
            rows = _parse_csv(file)
        elif filename.endswith((".xlsx", ".xls")):
            rows = _parse_excel(file)
        else:
            return Response({"detail": "Format non supporté. Utilisez CSV ou Excel (.xlsx)"}, status=status.HTTP_400_BAD_REQUEST)

        if not rows:
            return Response({"detail": "Le fichier est vide ou mal formaté"}, status=status.HTTP_400_BAD_REQUEST)

        imported = []
        errors = []

        for i, row in enumerate(rows, start=2):
            try:
                nom = (row.get("nom") or "").strip()
                if not nom:
                    errors.append({"ligne": i, "erreur": "Nom manquant"})
                    continue

                quantite_raw = row.get("quantite") or "0"
                try:
                    quantite = int(float(quantite_raw))
                except (ValueError, TypeError):
                    quantite = 0

                if quantite < 0:
                    errors.append({"ligne": i, "erreur": "Quantité négative"})
                    continue

                item = StockService.ajouter_ou_mettre_a_jour(
                    structure=structure,
                    nom=nom,
                    type_item="MEDICAMENT",
                    quantite=quantite,
                    disponible=True,
                    seuil_alerte=5,
                )
                imported.append({"id": str(item.id), "nom": item.nom, "type_item": item.type_item})

            except Exception as e:
                errors.append({"ligne": i, "erreur": str(e)})

        return Response({
            "message": f"{len(imported)} médicament(s) importé(s)",
            "imported": len(imported),
            "errors_count": len(errors),
            "errors": errors[:20],
        }, status=status.HTTP_200_OK)


class ImportStockView(APIView):

    @gestionnaire_required
    def post(self, request):
        structure_id = request.data.get("structure_id")
        assert_gestionnaire_owns_structure(request.user, structure_id)
        structure = Structure.objects.get(id=structure_id)

        file = request.FILES.get("file")
        if not file:
            return Response(
                {"detail": "Aucun fichier fourni"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        filename = file.name.lower()
        if filename.endswith(".csv"):
            rows = _parse_csv(file)
        elif filename.endswith((".xlsx", ".xls")):
            rows = _parse_excel(file)
        else:
            return Response(
                {"detail": "Format non supporté. Utilisez CSV ou Excel (.xlsx)"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not rows:
            return Response(
                {"detail": "Le fichier est vide ou mal formaté"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        imported = []
        errors = []

        for i, row in enumerate(rows, start=2):
            try:
                nom = row.get("nom", "").strip()
                type_item = row.get("type_item", "").strip().upper()
                quantite = int(row.get("quantite", 0))
                seuil_alerte = int(row.get("seuil_alerte", 5))
                disponible_raw = row.get("disponible", "true").strip().lower()
                disponible = disponible_raw in ("true", "1", "oui", "yes", "vrai")

                if not nom:
                    errors.append({"ligne": i, "erreur": "Nom manquant"})
                    continue

                if type_item not in ("MEDICAMENT", "EQUIPEMENT", "CONSOMMABLE"):
                    errors.append({"ligne": i, "erreur": f"Type invalide: {type_item}"})
                    continue

                if quantite < 0:
                    errors.append({"ligne": i, "erreur": "Quantité négative"})
                    continue

                item = StockService.ajouter_ou_mettre_a_jour(
                    structure=structure,
                    nom=nom,
                    type_item=type_item,
                    quantite=quantite,
                    disponible=disponible,
                    seuil_alerte=seuil_alerte,
                )
                imported.append({"id": str(item.id), "nom": item.nom, "type_item": item.type_item})

            except Exception as e:
                errors.append({"ligne": i, "erreur": str(e)})

        return Response(
            {
                "message": f"{len(imported)} article(s) importé(s)",
                "imported": len(imported),
                "errors_count": len(errors),
                "errors": errors[:20],
            },
            status=status.HTTP_200_OK,
        )
