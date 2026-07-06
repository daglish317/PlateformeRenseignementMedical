from rest_framework import serializers


class StructureMiniSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    nom = serializers.CharField()


class SearchResultSerializer(serializers.Serializer):

    structure = StructureMiniSerializer()
    score = serializers.IntegerField()