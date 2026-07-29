from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import StructureService
from .serializers import StructureServiceSerializer, StructureServiceCreateUpdateSerializer
from utilisateurs.decorators import admin_required
from search.utils.fuzzy import suggest


class ServiceListView(APIView):

    def get(self, request):
        queryset = StructureService.objects.all()
        type_svc = request.query_params.get("type")
        nom = request.query_params.get("nom")
        est_actif = request.query_params.get("est_actif")
        fuzzy = request.query_params.get("fuzzy", "false").lower() == "true"

        if nom and fuzzy:
            results = suggest(nom, limit=20)
            serializer = StructureServiceSerializer(results, many=True)
            return Response(serializer.data)

        if type_svc:
            queryset = queryset.filter(type=type_svc)
        if nom:
            queryset = queryset.filter(nom__icontains=nom)
        if est_actif is not None:
            queryset = queryset.filter(est_actif=est_actif.lower() == "true")

        queryset = queryset.order_by("type", "nom")
        serializer = StructureServiceSerializer(queryset, many=True)
        return Response(serializer.data)


class ServiceDetailView(APIView):

    def get(self, request, pk):
        try:
            service = StructureService.objects.get(id=pk)
        except StructureService.DoesNotExist:
            return Response({"detail": "Service introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(StructureServiceSerializer(service).data)


class ServiceCreateView(APIView):

    @admin_required
    def post(self, request):
        serializer = StructureServiceCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = StructureService.objects.create(**serializer.validated_data)
        return Response(
            {"message": "Service créé avec succès.", "data": StructureServiceSerializer(service).data},
            status=status.HTTP_201_CREATED,
        )


class ServiceUpdateView(APIView):

    @admin_required
    def put(self, request, pk):
        try:
            service = StructureService.objects.get(id=pk)
        except StructureService.DoesNotExist:
            return Response({"detail": "Service introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = StructureServiceCreateUpdateSerializer(service, data=request.data)
        serializer.is_valid(raise_exception=True)
        for champ, valeur in serializer.validated_data.items():
            setattr(service, champ, valeur)
        service.save()
        return Response({"message": "Service modifié.", "data": StructureServiceSerializer(service).data})


class ServiceDeleteView(APIView):

    @admin_required
    def delete(self, request, pk):
        try:
            service = StructureService.objects.get(id=pk)
        except StructureService.DoesNotExist:
            return Response({"detail": "Service introuvable."}, status=status.HTTP_404_NOT_FOUND)
        service.delete()
        return Response({"message": "Service supprimé."}, status=status.HTTP_200_OK)
