# -*- coding: utf-8 -*-
from rest_framework import serializers
from lbs2 import models


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Location
        fields = ('id', 'ts', 'longitude', 'latitude', )


class VehicleSerializer(serializers.ModelSerializer):
    location_set = LocationSerializer(many=True)

    class Meta:
        model = models.Object
        fields = ('id', 'name', 'created', 'users', 'visible', 'location_set', )
