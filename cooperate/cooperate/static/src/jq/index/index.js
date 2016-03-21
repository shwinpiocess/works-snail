/**
 * 
 * @authors luozh@snail.com
 * @date    2016-01-19 09:45:35
 * @version index.html
 */

// 富文本编辑控件
$('#summernote').summernote({
    height: 300,                 
    minHeight: null,
    maxHeight: null,
    focus: true,
    lang: 'zh-CN',
    toolbar: [
        // [groupName, [list of button]]
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['fontsize', ['fontsize', 'fontname']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']],
        ['table', ['table']],
        ['insert', ['hr', 'link', 'picture']],
        ['Misc', ['undo', 'redo', 'fullscreen']],
        ['font', ['strikethrough', 'superscript', 'subscript']]
      ]
});

var vm = new Vue({
    el: '#index_box',
    data: {
        lists: [],
        selectedName: ''
    },
    methods: {

        // 获取章程列表
        getList: function () {
            $.ajax({
                url: '/index/ajax_get_departments/',
                type: 'POST',
                dataType: 'json',
            })
            .done(function(data) {
                vm.lists = data;

                if (vm.selectedName === '') {
                    vm.selectedName = vm.lists[0].header;

                    $('#summernote').summernote('code', vm.lists[0].html);
                }
            })
            .fail(function() {
                showAlert('jError', '出错了 :(', false);
            });
        },

        // 选择部门
        selectDepartment: function () {

            this.lists.forEach(function (e) {
                if (e.header === vm.selectedName) {
                    $('#summernote').summernote('code', e.html);
                }
            });
        },

        // 提交章程
        submitFn: function () {
            var markupStr = $('#summernote').summernote('code');

            if (!this.selectedName) {
                showAlert('jNotify', '请选择所属部门', true);

                return false;
            } else if (!markupStr.trim()) {
                showAlert('jNotify', '请填写部门章程', true);
            } else {

                $.ajax({
                    url: '/index/ajax_edit_department/',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        department_name: vm.selectedName,
                        content: markupStr
                    }
                })
                .done(function(data) {
                    if (data.result === 1) {
                        showAlert('jSuccess', '提交成功 :)', true);

                        vm.getList();
                    } else {
                        showAlert('jError', '提交失败 :(', false);
                    }
                })
                .fail(function() {
                    showAlert('jError', '提交失败 :(', false);
                });
            }
        } 
    }
});

// 加载渲染数据
vm.getList();

