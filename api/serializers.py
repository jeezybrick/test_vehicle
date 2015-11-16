# -*- coding: utf-8 -*-
from rest_framework import serializers
from lbs2 import models


class VehicleSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.Object
        fields = ('id', 'name', 'created', 'users', 'visible', )
