/**
 * 
 * @authors luozh@snail.com
 * @date    2016-01-19 09:45:35
 * @version department.html
 */

 // datetime
 $('.time-form').datetimepicker({
     weekStart: 1,
     /*endDate: '2016-01-20',*/
     todayBtn: 1,
     autoclose: 1,
     todayHighlight: 1,
     startView: 2,
     minView: 2,
     forceParse: 0,
     linkField: "mirror_field",
     pickerPosition: "bottom-left"
 });

var vm = new Vue({
    el: '#department_box',
    data: {
        curSelected: '',
        workList: [],
        departments: [],
        user: '',
        len: '10',
        searchTime: '',
        searchProgress: '',
        searchTime: '',
        searchProgress: ''
    },
    methods: {

        // 初次加载渲染
        getList: function() {
            $.ajax({
                url: '/group/ajax_get_routines/',
                type: 'POST',
                dataType: 'json',
                data: {
                    department_name: vm.curSelected,
                    length: vm.len,
                    time_filter: vm.searchTime,
                    status_filter: vm.searchProgress
                }
            })
            .done(function(data) {
                vm.workList = data.list;
                vm.departments = data.department;
                vm.user = data.user;
                vm.curSelected === '' ? vm.curSelected = vm.departments[0] : '';
            })
            .fail(function() {
                showAlert('jError', '出错了 :(', false);
            });
            
        },

        // 保存事务
        saveData: function(index, id, author) {
            var obj = $('#department_table tbody tr').eq(index);

            if (author !== this.user) {
                showAlert('jNotify', '无权限操作 :(', true);

                return false;
            } else {
                $.ajax({
                    url: '/group/ajax_edit_routine/',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        id: this.workList[index].id,
                        department_name: vm.curSelected,
                        content: obj.find('td').eq(1).html(),
                        status: vm.workList[index].status,
                        time : obj.find('td').eq(3).html()
                    }
                })
                .done(function(data) {
                    if (data.result === 1) {
                        showAlert('jSuccess', '保存成功 :)', true);

                        vm.getList();
                    } else {
                        showAlert('jError', '保存失败 :(', false);
                    }
                })
                .fail(function() {
                    showAlert('jError', '保存失败 :(', false);
                });
            }
        },

        // 删除事务
        deleteData: function(index, id, author) {
            if (author !== this.user) {
                showAlert('jNotify', '无权限操作 :(', true);

                return false;
            } else if (id === '') {
                vm.workList.splice(index, 1);
            } else {
                var isDelete = confirm('是否确认删除？');

                if (isDelete) {
                    $.ajax({
                        url: '/group/ajax_delete_routine/',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            id: id
                        }
                    })
                    .done(function(data) {
                        if (data.result === 1) {
                            vm.workList.splice(index, 1);

                            showAlert('jSuccess', '删除成功 :)', true);
                        } else {
                            showAlert('jError', '删除失败 :(', false);
                        }
                    })
                    .fail(function() {
                        showAlert('jError', '删除失败 :(', false);
                    });
                }
            }
        },

        // 添加事务
        addData: function() {
            var date = new Date(),
                curMonth = date.getMonth() + 1,
                curDate = date.getDate(),
                curHour = date.getHours(),
                curMinute = date.getMinutes();

            curMonth < 10 ? curMonth = '0' + curMonth : '';
            curDate < 10 ? curDate = '0' + curDate : '';
            curHour < 10 ? curHour = '0' + curHour : '';
            curMinute < 10 ? curMinute = '0' + curMinute : '';

            this.workList.unshift({
                id: '',
                content: '',
                author: this.user,
                status: 0,
                time: date.getFullYear() + '-' + curMonth + '-' + curDate + ' ' + curHour + ':' + curMinute
            });
        }
    }
});

// 渲染事务列表
vm.getList();
