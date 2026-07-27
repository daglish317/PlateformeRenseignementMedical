from rest_framework.views import APIView
from rest_framework.response import Response

from plateau_technique.models import PlateauTechnique
from plateau_technique.serializers import PlateauTechniqueSerializer


class AnalysesByStructureView(APIView):

    def get(self, request, structure_id):
        data = PlateauTechnique.objects.filter(
            structure_id=structure_id,
            catalogue__type="ANALYSE",
        ).select_related("catalogue")

        return Response(PlateauTechniqueSerializer(data, many=True).data)
