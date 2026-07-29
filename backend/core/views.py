import os
import tempfile

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser

from utilisateurs.permissions import IsAdmin
from structures.models import StructureService
from core.imports.service import ImportService


class CatalogueImportView(APIView):
    permission_classes = [IsAdmin]
    parser_classes = [MultiPartParser]

    def post(self, request):

        fichier = request.FILES.get("file")
        if not fichier:
            return Response({"detail": "Fichier requis"}, status=400)

        suffix = os.path.splitext(fichier.name)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            for chunk in fichier.chunks():
                tmp.write(chunk)
            tmp_path = tmp.name

        result = ImportService.importer(
            tmp_path,
            StructureService,
            required_fields=["nom", "type"],
        )

        os.unlink(tmp_path)
        return Response(result)
