#!/usr/bin/python
# -*- coding:utf-8 -*-
import sys
reload(sys)
sys.setdefaultencoding('utf-8')

from apps.group.models import Routine

import logging
logger = logging.getLogger('logger')


#===============================================================================
# Model的直接操作方法，get_or_create、get、filter 等。
#===============================================================================
def create_routine_by_params(**kwargs):
    '''
    @param kwargs: key=value 的键值对
    @return: 元组(obj,boolean)
    @note: 创建  对象
    '''
    return Routine.objects.create(**kwargs)

def get_or_create_routine_by_params(**kwargs):
    '''
    @param kwargs: key=value 的键值对
    @return: 元组(obj,boolean)
    @note: 获取或创建  对象
    '''
    return Routine.objects.get_or_create(**kwargs)

def get_routine_by_params(**kwargs):
    '''
    @param kwargs: key=value 的键值对
    @return: obj或None
    @note: 获取  对象
    '''
    try:
        return Routine.objects.get(**kwargs)
    except Routine.DoesNotExist:
        logger.error(u"Routine对象不存在（%s）" % kwargs)
    except Routine.MultipleObjectsReturned:
        logger.error(u"Routine对象存在多条记录（%s）" % kwargs)
    return None

def get_routines_by_params(**kwargs):
    '''
    @param kwargs: key=value 的键值对
    @return: [obj,]
    @note: 获取  对象列表
    '''
    return Routine.objects.filter(**kwargs)

