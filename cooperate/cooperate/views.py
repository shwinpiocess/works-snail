#!/usr/bin/env python
# -*- coding: UTF-8 -*-
import os, sys
sys.path.insert(0, os.path.abspath(os.curdir))

from utils.decorator import render_to, login_required
from django.views.decorators.csrf import csrf_exempt
import logging

from django.contrib import auth
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse

from django.contrib.auth import authenticate, login as jlogin, logout as jlogout
from releaseinfo import LOGIN_URL, ACCOUNT_AUTH_URL
from service import _user
import urllib, urllib2
import json

logger = logging.getLogger('logger')

@render_to("login.html")
@csrf_exempt
def login(request):
    '''
    @note: 接收用户名和密码并完成登录跳转功能，登录成功进入首页，登录失败不跳转
    '''
    redirect_to = request.REQUEST.get("next", reverse('index'))
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
      
        user = auth.authenticate(username=username, password=password)
        if user is not None and user.is_active:
            auth.login(request, user)
            logger.debug("[user login] %s login ok."%(username))
            return HttpResponseRedirect(redirect_to)
      
        if user and not user.is_active:
            error_msg = u'账号未激活'
        else:
            error_msg = u'账号或密码错误，请重新输入'
      
    else:
        if request.user.is_authenticated():
            return HttpResponseRedirect(redirect_to)
          
    TEMPLATE = "login.html"
    return locals()

# def login(request):
#     guid = request.GET.get('VerifyId')
#     if not guid:
#         return HttpResponseRedirect(LOGIN_URL)
#     data = {'action':'checkguid1','Guid':guid}
#     req = urllib2.Request(ACCOUNT_AUTH_URL)
#       
#     params = urllib.urlencode(data)
#     response = urllib2.urlopen(req, params)
#     jsonText = response.read()
#     return_dict = json.loads(jsonText)
#           
#     if not return_dict:
#         return HttpResponseRedirect(LOGIN_URL)
#           
#     #user
#     username = return_dict.get('sAccount')
#     name = return_dict.get('sUserName')
#     uid= return_dict.get('iUserID')
#     if None in [username, name, uid]:
#         return HttpResponseRedirect(LOGIN_URL)
#           
#     u = _user.get_or_create_user_by_params(username=username)[0]
#     u.set_password(username)
#     u.first_name=name
#     u.last_name=uid
#     u.save()
#           
#     user = authenticate(username=u.username, password=u.username)
#     jlogin(request, user)
#           
#     redirect_to = request.REQUEST.get("next", reverse('index'))
#     return HttpResponseRedirect(redirect_to)

@login_required
def logout(request):
    jlogout(request)
    response = HttpResponseRedirect(LOGIN_URL)
    response.delete_cookie('sig')
    response.delete_cookie('falcon-portal')
    return response