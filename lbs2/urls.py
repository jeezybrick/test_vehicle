# -*- coding: utf-8 -*-

from django.conf.urls import url
from django.views.generic import TemplateView
from lbs2 import views

urlpatterns = [

    # Auth views
    url(r'^auth/login/$', views.LoginView.as_view(), name='login'),
    url(r'^auth/logout/$', views.get_logout, name='logout'),
    url(r"^auth/register/$", views.RegisterView.as_view(), name='register'),
    url(r"^auth/register/success/$", TemplateView.as_view(template_name='lbs2/auth/register_success.html'),
        name='register_success'),

    url(r"^user/change_password/$", 'django.contrib.auth.views.password_change', name='password_change'),
    url(r"^user/change_password/done/$", 'django.contrib.auth.views.password_change_done', name='password_change_done'),

]
