# -*- coding: utf-8 -*-
from rest_framework import serializers
from lbs2 import models


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Location
        fields = ('ts', 'longitude', 'latitude', 'distance', )


class VehicleSerializer(serializers.ModelSerializer):
    location_set = LocationSerializer(many=True, read_only=True)

    class Meta:
        model = models.Object
        fields = ('id', 'name', 'created', 'users', 'visible', 'location_set', )
