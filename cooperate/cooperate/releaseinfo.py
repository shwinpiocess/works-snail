#encoding:utf-8

import os
REL_SITE_ROOT = os.path.dirname(os.path.abspath(__file__))

REL_STATIC_ROOT = os.path.join(REL_SITE_ROOT, 'static')

REL_DEBUG = True

DATABASE_ENGINE = 'django.db.backends.mysql'
DATABASE_NAME = 'cooperate'
DATABASE_USER = 'root'
DATABASE_PASSWORD = 'root'
DATABASE_HOST = '172.18.80.170'
DATABASE_PORT = '3306'

REL_ROOT_PATH = 'http://127.0.0.1:5000'
REL_MEDIA_URL = '%s/file/' % REL_ROOT_PATH
REL_MEDIA_ROOT = os.path.join(REL_SITE_ROOT, 'file')

#REL_CACHE_BACKEND = 'memcached://127.0.0.1:11211/'
REL_CACHE_BACKEND = 'locmem:///?timeout=300&max_entries=30000'

if REL_DEBUG:
    REL_CACHE_TIME = 60
else:
    REL_CACHE_TIME = 600

bufsize = 1024

## ENTRY OF PLATFORM_HOST
PLATFORM_HOST = "http://10.103.4.19"

QUESTION_API = "http://172.18.80.170:2000/api/add_question/"

#LOGIN_URL = PLATFORM_HOST + '/index.htm'
LOGIN_URL = '/login/'

SPECIAL_USERS = [
                'wx', 'luozh', 'shenjh', 'wyi',
                 'caijianqing','huangxin','liuj','masw','panchengj','shencheng',
                 ]
# SPECIAL_USER_NAME = u'监控平台'
SPECIAL_USER_NAME = u'张延礼'

# account auth of cmdb, get user permission.
ACCOUNT_AUTH_URL = PLATFORM_HOST + '/service/AccountHandler.ashx'

PRODUCT_URL = 'http://10.206.2.5/ops/cmdb/business/service/QueryProductByMt/'