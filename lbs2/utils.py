# -*- coding: utf-8 -*-
import datetime
from lbs2.models import Object


def sort_by_date(request):

    position_for_last_days = 10  # Show user position vehicle for last 1 day

    start_date = request.GET.get('date_from', datetime.datetime.now() - datetime.timedelta(days=position_for_last_days))
    end_date = request.GET.get('date_to', datetime.datetime.now())
    return Object.objects.filter(location__ts__range=(start_date, end_date)).distinct()


def sort_by_date_detail(request, vehicle_id):

    position_for_last_days = 1  # Show user position vehicle for last 1 day

    start_date = request.GET.get('date_from', datetime.datetime.now() - datetime.timedelta(days=position_for_last_days))
    end_date = request.GET.get('date_to', datetime.datetime.now())
    return Object.objects.get(created__range=(start_date, end_date), id=vehicle_id)


def set_choose_dates(request):
    position_for_last_days = 1  # Show user position vehicle for last 1 day
    dates = {}
    start_date = request.GET.get('date_from', datetime.datetime.now() - datetime.timedelta(days=position_for_last_days))
    end_date = request.GET.get('date_to', datetime.datetime.now())
    dates['start_date'] = start_date
    dates['end_date'] = end_date
    return dates
