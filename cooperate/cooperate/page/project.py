# -- encoding=utf-8 --
import os, sys
sys.path.insert(0, os.path.abspath(os.curdir))

from utils.decorator import render_to, login_required
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
import logging
import traceback
import json
from service import _report
import datetime
from releaseinfo import SPECIAL_USERS, SPECIAL_USER_NAME
from utils.util import get_product_list_by_user, get_department_list_by_user

logger = logging.getLogger("logger")

@login_required
@csrf_exempt
@render_to('project/meeting.html')
def meeting_index(request):
    return locals()


@csrf_exempt
def ajax_get_weeklys(request):
    user = request.user
    result = {}
    
    today = datetime.date.today()
    #本周一
    monday = today - datetime.timedelta(today.weekday())
    #本周日
    sunday = today + datetime.timedelta(6 - today.weekday())
    
    departments = get_department_list_by_user(user)
    result['department'] = [d.name for d in departments]
        
    department_name = request.POST.get('department_name','')
    
    weekly_list = []
    if departments:
        if department_name:
            department = _report.get_department_by_params(name=department_name)
        else:
            department = departments[0]
    
        weeklys = _report.get_weeklys_by_params(department=department,start_time__gte=monday,end_time__lte=sunday)
        for weekly in weeklys:
            author = weekly.user.username
            time = datetime.datetime.strftime(weekly.updated,'%Y-%m-%d')
            
            weekly_progress_list = _report.get_weeklyProgresss_by_params(weekly=weekly)
            weekly_plan_list = _report.get_weeklyPlans_by_params(weekly=weekly)
            progress_list = [progress.content for progress in weekly_progress_list]
            plan_list = [plan.content for plan in weekly_plan_list]
            weekly_list.append({
                                'progress':progress_list, 
                                'plan':plan_list, 
                                'author': author, 
                                'time':time
                                })
    
    result['list'] = weekly_list
    
    return HttpResponse(json.dumps(result), content_type="application/json")


@csrf_exempt
def ajax_get_tasks(request):
    user = request.user
    result = {}
    
    today = datetime.date.today()
    #上周六
    saturday = today - datetime.timedelta(2 + today.weekday())
    #本周五
    friday = today + datetime.timedelta(4 - today.weekday())
    
    cnname = user.first_name
    if user.username in SPECIAL_USERS:
        cnname = SPECIAL_USER_NAME
    product_names = get_product_list_by_user(cnname)
    products = _report.get_products_by_params(name__in=product_names)
    result['product'] = [p.name for p in products]
        
    product_name = request.POST.get('product_name','')
    product = _report.get_product_by_params(name=product_name)
    
    ontime = []
    taskPeriods = _report.get_taskPeriods_by_params(product=product).order_by('period')
    for task_period in taskPeriods:
        time = ''
        if task_period.time:
            time =task_period.time
        ontime.append(time)
    result['ontime'] = ontime
    
    list = []
    taskCircles = _report.get_taskCircles_by_params(product=product, start_time=saturday, end_time=friday)
    if taskCircles:
        task_circle = taskCircles[0]
        taskInfos = _report.get_taskInfos_by_params(task_circle=task_circle)
        for task_info in taskInfos:
            list.append({'content':task_info.content, 'rate': task_info.rate})
    else:
        list.append({'content':'-', 'rate': '-'})
    
    result['list'] = list
    
    result['start_time'] = datetime.datetime.strftime(saturday,'%Y-%m-%d')
    result['end_time'] = datetime.datetime.strftime(friday,'%Y-%m-%d')
    
    return HttpResponse(json.dumps(result), content_type="application/json")


from django.conf.urls import patterns, url
urlpatterns = patterns('',
    url(r'^project/meeting/$', meeting_index, name='meeting_index'),
    url(r'^project/ajax_get_weeklys/$', ajax_get_weeklys, name='ajax_get_weeklys'),
    url(r'^project/ajax_get_tasks/$', ajax_get_tasks, name='ajax_get_tasks'),
    
)