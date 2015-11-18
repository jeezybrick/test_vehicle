# -*- coding: utf-8 -*-
import datetime
from rest_framework import serializers
from lbs2 import models


class LocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Location
        fields = ('ts', 'longitude', 'latitude', 'distance', )


class VehicleSerializer(serializers.ModelSerializer):

    location_set = serializers.SerializerMethodField()

    # return sorted by date location
    def get_location_set(self, obj):
        request = self.context.get('request', None)
        if request:
            position_for_last_days = 1  # Show user position vehicle for last 1 day

            start_date = request.GET.get('date_from', datetime.datetime.now() - datetime.timedelta(days=position_for_last_days))
            end_date = request.GET.get('date_to', datetime.datetime.now())
            queryset = models.Location.objects.filter(ts__range=(start_date, end_date), object_id=obj.id)
            serializer = LocationSerializer(queryset, many=True)
            return serializer.data
        else:
            return False

    class Meta:
        model = models.Object
        fields = ('id', 'name', 'created', 'users', 'is_visible', 'location_set', )


class VehicleDetailSerializer(serializers.ModelSerializer):

    location_set = LocationSerializer(many=True, read_only=True)

    class Meta:
        model = models.Object
        fields = ('id', 'name', 'created', 'users', 'is_visible', 'location_set', )


class SettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Setting
        fields = ('max_objects', 'max_points', )
