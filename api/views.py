# -*- coding: utf-8 -*-
from django.http import Http404
from rest_framework.views import APIView
from rest_framework import status, permissions
from rest_framework.response import Response
from api import serializers
from api.permissions import IsAuthorOrReadOnly
from lbs2 import models, utils


# List of orders
class VehicleList(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def get(self, request):

        queryset = utils.sort_by_date(request)

        serializer = serializers.VehicleSerializer(queryset, many=True)
        return Response(serializer.data)


# Order detail
class VehicleDetail(APIView):
    permission_classes = (permissions.IsAuthenticated, IsAuthorOrReadOnly, )

    def get_object(self, pk):
        try:
            return models.Object.objects.get(pk=pk)
        except models.Object.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        order = self.get_object(pk)
        serializer = serializers.VehicleSerializer(order)
        return Response(serializer.data)

    def put(self, request, pk, format=None):
        vehicle = self.get_object(pk)
        serializer = serializers.VehicleSerializer(vehicle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
