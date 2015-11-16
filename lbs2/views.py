from django.shortcuts import render
from django.views.generic import View
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from django.template.response import TemplateResponse
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.core.urlresolvers import reverse
from django.utils.datastructures import MultiValueDictKeyError
from lbs2 import forms, models


# For login
class LoginView(View):
    form_class = forms.MyLoginForm
    template_name = 'lbs2/auth/login.html'
    title = _('Sign In')

    def get(self, request):
        form = self.form_class(request)
        context = {
            'form': form,
            'title': self.title,
        }
        return TemplateResponse(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request, data=request.POST)
        context = {
            'form': form,
            'title': self.title,
        }
        if form.is_valid():
            auth_login(request, form.get_user())
            return HttpResponseRedirect(self.get_success_url())
        return TemplateResponse(request, self.template_name, context)

    def get_success_url(self):
        return reverse("home")


# Registration view
class RegisterView(View):
    form_class = forms.MyRegForm
    template_name = 'lbs2/auth/register.html'

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('register_success'))
        return render(request, self.template_name, {'form': form})


# logout function
def get_logout(request):

    auth_logout(request)
    return HttpResponseRedirect(reverse("home"))


# Home view
class HomeView(View):
    template_name = 'lbs2/home.html'
    max_points = 2  # max pints in the map

    def get(self, request):
        objects = objects_all = None

        if self.request.user.is_authenticated():  # show map and staff is user auth

            objects_all = self.request.user.object_set.all()[:self.max_points]

            try:
                request.GET["vehicle"]
            except MultiValueDictKeyError:
                objects = objects_all
            else:
                # sort vehicle by get request
                objects = models.Object.objects.filter(id=request.GET["vehicle"])[:self.max_points]

        return render(request, self.template_name, {'objects': objects, 'objects_all': objects_all,
                                                    'max_points': self.max_points})


# Vehicle detail
class VehicleDetailView(View):
    template_name = 'lbs2/vehicles/show.html'

    def get(self, request, **kwargs):

        # get item and current user rate to this item
        vehicle = models.Object.objects.get(id=kwargs["pk"])

        context = {
            'vehicle': vehicle,
        }
        return render(request, self.template_name, context)
