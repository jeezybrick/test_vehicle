
from django.conf.urls import url
from api import views


urlpatterns = [
    url(r'^api/vehicle/$', views.VehicleList.as_view(), name='vehicle_list_api'),
    url(r'^api/vehicle/(?P<pk>[0-9]+)/$',
        views.VehicleDetail.as_view(), name='vehicle_detail_api'),
]