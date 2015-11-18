# -*- coding: utf-8 -*-
from datetime import datetime
from django.db import models
from django.utils import timezone
from django.utils.timezone import now
from django.utils.translation import ugettext_lazy as _
from django.contrib.auth.models import AbstractUser


# Extend User model
class User(AbstractUser):

    name = models.CharField(max_length=100)
    locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    admin = models.SmallIntegerField(default=0)
    last_failed_login = models.DateTimeField(_('last login'), blank=True, null=True)
    fail_count = models.IntegerField(default=0)

    USERNAME_FIELD = 'username'

    def __unicode__(self):
        return self.username

    class Meta(object):
        unique_together = ('email', )


class Provider(models.Model):

    name = models.CharField(max_length=255, unique=True)

    def __unicode__(self):
        return self.name


# Vehicle model
class Object(models.Model):

    name = models.CharField(max_length=50, unique=True)
    valid_from = models.DateTimeField(null=False, default=datetime.now)
    valid_to = models.DateTimeField()
    provider = models.ForeignKey(Provider, on_delete='NO ACTION')
    created = models.DateTimeField(null=False, auto_now_add=True)
    nofqueries = models.IntegerField(default=0)
    nofsqueries = models.IntegerField(default=0)
    lastquery = models.DateTimeField()
    active = models.NullBooleanField()
    users = models.ManyToManyField(User)
    is_visible = models.BooleanField(default=True)

    def __unicode__(self):
        return self.name


class Location(models.Model):
    ts = models.DateTimeField(null=False, auto_now_add=True)
    object = models.ForeignKey(Object)
    bssid = models.CharField(max_length=50)
    longitude = models.PositiveSmallIntegerField()
    latitude = models.PositiveSmallIntegerField()
    azimuth = models.PositiveSmallIntegerField()
    distance = models.PositiveSmallIntegerField()


class Setting(models.Model):
    name = models.CharField(max_length=255)
    value = models.CharField(max_length=255)
    description = models.CharField(max_length=255)
    max_objects = models.PositiveIntegerField()
    max_points = models.PositiveIntegerField()
