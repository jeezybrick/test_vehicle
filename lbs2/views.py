from datetime import datetime
from django.shortcuts import render, redirect
from django.views.generic import View
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from django.template.response import TemplateResponse
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.core.urlresolvers import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.utils.datastructures import MultiValueDictKeyError
from lbs2 import forms, models, utils


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

    def get(self, request):
        dates = {
            'start_date': datetime.now(),
            'end_date': datetime.now(),
        }
        try:
            settings = models.Setting.objects.get(id=1)
        except ObjectDoesNotExist:
            max_points = 999
            max_objects = 999
        else:
            max_points = settings.max_points  # max points in the map
            max_objects = settings.max_objects  # max objects to pick

        objects = objects_all = points = None

        if self.request.user.is_authenticated():  # show map and staff is user auth

            objects_all = self.request.user.object_set.all()[:max_objects]
            objects = utils.sort_by_date(request)[:max_objects]
            points = objects[:max_points]
            dates = utils.set_choose_dates(request)
            print(dates)

        return render(request, self.template_name, {'objects': objects,
                                                    'objects_all': objects_all,
                                                    'points': points,
                                                    'max_points': max_points,
                                                    'start_date': dates['start_date'],
                                                    'end_date': dates['end_date'],
                                                    })


# Vehicle detail
class VehicleDetailView(View):
    template_name = 'lbs2/vehicles/show.html'

    def get(self, request, **kwargs):

        # get item and current user rate to this item
        # vehicle = utils.sort_by_date_detail(request, kwargs["pk"])
        vehicle = models.Object.objects.get(id=kwargs["pk"])

        locations = vehicle.location_set.all()

        context = {
            'vehicle': vehicle,
            'locations': locations
        }
        return render(request, self.template_name, context)

    def post(self, request, **kwargs):

        object = models.Object.objects.get(id=kwargs["pk"])
        object.visible = not object.visible
        object.save()
        return redirect(reverse("home"))
