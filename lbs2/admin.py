from django.contrib import admin
from lbs2.models import User, Object, Location, Provider, Setting

# Register your models here.


class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "created_at")


class ObjectAdmin(admin.ModelAdmin):
    list_display = ("name", "provider", "created")


class LocationAdmin(admin.ModelAdmin):
    list_display = ("ts", "object", "longitude", "latitude", "distance")


class ProviderAdmin(admin.ModelAdmin):
    list_display = ("name", )


class SettingAdmin(admin.ModelAdmin):
    list_display = ("max_objects", "max_points", )


admin.site.register(User, UserAdmin)
admin.site.register(Object, ObjectAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(Provider, ProviderAdmin)
admin.site.register(Setting, SettingAdmin)
