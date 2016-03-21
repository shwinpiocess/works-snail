/**
 * 
 * @authors Your Name (you@example.org)
 * @date    2015-09-21 18:14:24
 * @version $Id$
 */

//文件浏览
function findFile(obj_upload, textfield) {
    obj_upload.trigger('click');
    textfield.val(obj_upload.val());
    obj_upload.off("change").on("change", function() {
        textfield.val(obj_upload.val());
    });
}

$("#find_file").off("click").on("click", function() {
    var textfield = $("#file_show");
    var obj_upload = $("#file_road");
    findFile(obj_upload, textfield);
});

//文件上传
$("#upload_file").off("click").on("click", function() {
    var product_id = $('#product_select').val();
    var group_id = $('#group_select').val();
    if (!product_id) {
        jNotify("请选择业务！");
        return false;
    } else if (!group_id) {
        jNotify("请选择范围！");
        return false;
    } else {
        ajax_file_upload(product_id, group_id);
    }
});

//接入添加分组
$("#add_group").off("click").on("click", function() {
    var html = '<div class="form-group"><div class="col-sm-3 col-sm-offset-1"><input name="group_name" type="text" class="form-control" placeholder="公告分组名称"></div><div class="col-sm-7"><input name="group_path" type="text" class="form-control" placeholder="公告文件路径"></div><div class="col-sm-1"><span class="delete-h pointer glyphicon glyphicon-minus"></span></div></div>';
    $(".group-list").append(html);
});

//修改添加分组
$("#modify_add_group").off("click").on("click", function() {
    if($("#modify_box").hasClass("hide")) {
        jNotify("请先选择需要修改的业务名称！");
    }
    else {
        var html = '<div class="form-group"><div class="col-sm-3 col-sm-offset-1"><input name="modify_group_name" type="text" class="form-control" placeholder="公告分组名称"></div><div class="col-sm-7"><input name="modify_group_path" type="text" class="form-control" placeholder="公告文件路径"></div><div class="col-sm-1"><span class="delete-h pointer glyphicon glyphicon-minus"></span></div></div>';
        $("#modify_group_box").append(html);
    }
});

//退出
$("#exit_ok").on("click", function() {
    location.href = "/logout";
});

function ajax_file_upload(product_id, group_id) {
    var file = $("#file_road").get(0).files[0];
    if (file) {
        $.ajaxFileUpload({
            type: 'POST',
            url: '/product/ajax_file_upload/',
            secureuri: false,
            data: {
                'product_id': product_id,
                'group_id': group_id
            },
            fileElementId: 'file_road',
            dataType: 'json',
            success: function(data, status) {
                if (data.result == 1) {
                    $('#file_path_hide').val(data.filepath);
                    $('#file_uploaded').html('文件名：' + data.filename);
                    $('#file_md5').html('md5：' + data.hash_value);
                    jSuccess(data.msg);
                } else {
                    jError(data.msg);
                }
                $("#file_show").val('');
                $("#file_road").val('');
            },
            error: function(data, status, e) {
                jError(e);
            }
        });

        $("#file_show").val('');
        $("#file_road").val('');
    } else {
        jNotify('请选择上传文件！');

    }
}

//接入校验封装
function commom_product(product_name,ftp_info,file_name) {
    if (!product_name.val().trim() || !ftp_info.val().trim() || !file_name.val().trim()) {
        jNotify("有未填写的输入项，请检查！");
        return false;
    }

    var arr = ftp_info.val().trim().split(',');
    if (arr.length != 4) {
        jNotify("资源ftp站点信息 格式错误，请检查！");
        return false;
    }

    var ip = arr[0];
    if (is_ip(ip) == false) {
        return false;
    }
}

//接入拼接分组名及路径检测封装
function data_product(name_list,path_list){
    var name_arr = [],
        path_arr = [],
        id_arr = [];

    if(name_list.length == 0) {
        jNotify('至少添加一组分组信息！');
        return false;
    }
    for (var i = 0; i < name_list.length; i++) {
        name_arr.push(name_list.eq(i).val().trim());
        path_arr.push(path_list.eq(i).val().trim());
        var data_id = name_list.eq(i).attr("data-id");
        if(data_id) {
        	id_arr.push(data_id);
        }
        if (name_arr[i] === '' && path_arr[i] !== '') {
            jNotify('缺少对应路径的分组名称，请检查！');
            return false;
        }

        if (name_arr[i] !== '' && path_arr[i] === '') {
            jNotify('缺少对应分组的文件路径，请检查！');
            return false;
        }
    }

    //检测分组信息是否填写
    for (var j = 0; j < name_arr.length; j++) {
        if (name_arr[j] === '') {
           jNotify('存在尚未填写的公告分组信息！');
           return false;
        }
    }

    var group_name = name_arr.join(','),
        group_path = path_arr.join(','),
        group_id = id_arr.join(',');

    return data_arr = {
        "group_name" : group_name,
        "group_path" : group_path,
        "group_id" : group_id
    }
}

//保存接入
function save_product() {
    var product_name = $("#product_name"),
        ftp_info = $("#ftp_info"),
        file_name = $("#file_name"),
        name_list = $("input[name=group_name]"),
        path_list = $("input[name=group_path]");
    
    var valid_form = commom_product(product_name,ftp_info,file_name);
    if(valid_form === false){
        return false;
    }

    var valid_data = data_product(name_list,path_list);
    if(valid_data === false){
        return false;
    }
    else {
        group_name = valid_data.group_name;
        group_path = valid_data.group_path;
    }

    $.ajax({
        type: 'POST',
        url: '/product/save/',
        data: {
            'product_name': product_name.val(),
            'ftp_info': ftp_info.val(),
            'file_name': file_name.val(),
            'group_name': group_name,
            'group_path': group_path,
        },
        dataType: 'json',
        success: function(msg) {
            if (msg.result == 1) {
                jSuccess('保存业务成功！');
                $('#myModal').modal('hide');
                $.ajax({
                    type: "POST",
                    url: "/product/ajax_get_product_option/",
                    data: {},
                    dataType: "json",
                    error: function(XMLHttpRequest) {
                        //alert(XMLHttpRequest.responseText);
                        return false;
                    },
                    success: function(data) {
                        makeoption(data, 'product_select');
                        makeoption(data, 'modify_product_name');
                    }
                });
            }else{
                jError(msg.msg);
            }
        },
        error: function() {
            jError('保存业务失败！');
        }
    });
    return true;
}

//修改接入
function modify_product() {
    var product_name = $("#modify_product_name"),
        ftp_info = $("#modify_ftp_info"),
        file_name = $("#modify_file_name"),
        name_list = $("input[name=modify_group_name]"),
        path_list = $("input[name=modify_group_path]"),
        name_arr = [],
        path_arr = [];

    var valid_form = commom_product(product_name,ftp_info,file_name);
    if(valid_form === false){
        return false;
    }

    var valid_data = data_product(name_list,path_list);
    if(valid_data === false){
        return false;
    }
    else {
        group_name = valid_data.group_name;
        group_path = valid_data.group_path;
        group_id = valid_data.group_id;
    }
    
    //修改接入ajax
    $.ajax({
        type: 'POST',
        url: '/product/edit/',
        data: {
            'product_id': product_name.val(),
            'ftp_info': ftp_info.val(),
            'file_name': file_name.val(),
            'group_name': group_name,
            'group_path': group_path,
            'group_id' : group_id
        },
        dataType: 'json',
        success: function(msg) {
            if (msg.result == 1) {
                jSuccess('修改业务成功！');
                $('#modifyModal').modal('hide');
            }else{
                jError(msg.msg);
            }
        },
        error: function() {
            jError('修改业务失败！');
        }
    });
    return true;
    
}

//选择修改业务名称
$("#modify_product_name").on("change",function(){
    var product_id = $(this).val(),
        ftp_info = $("#modify_ftp_info"),
        file_name = $("#modify_file_name");
    if(!product_id) {
        $("#modify_box").addClass("hide");
    }
    else {
        //ajax
        $.ajax({
            type: "POST",
            url: "/product/ajax_get_productinfo/",
            data: {
                'product_id': product_id
            },
            dataType: "json",
            error: function(XMLHttpRequest) {
                //alert(XMLHttpRequest.responseText);
                return false;
            },
            success: function(data) {
                if(data.result==1){
                file_name.val(data.file_name);
                var ftp = [data.ftp_host,data.ftp_port,data.ftp_username,data.ftp_password];
                var ftp_group = ftp.join(',');
                ftp_info.val(ftp_group);
                var list = data.group_list;
                var len = list.length;
                var html = '';
                for(var i=0; i<len; i++){
                    html += '<div class="form-group"><div class="col-sm-3 col-sm-offset-1"><input data-id='+ list[i][0] +' name="modify_group_name" type="text" class="form-control" value='+list[i][1]+' placeholder="公告分组名称"></div><div class="col-sm-7"><input name="modify_group_path" type="text" class="form-control" value='+list[i][2]+' placeholder="公告文件路径"></div><div class="col-sm-1"><span class="delete-group pointer glyphicon glyphicon-remove"></span></div></div>';
                }
                $("#modify_group_box").empty().append(html);
                }
            }
        });
        $("#modify_box").removeClass("hide");
    }
});

//检测ip
function is_ip(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (!reg.test(ip)) {
        jNotify("ip格式输入有误，请检查！");
        return false;
    }
}

function makeoption(data, select_id) {
    var select = $('#' + select_id);
    var opt = select.children();
    opt.filter('option[value!=""]').remove();
    var add_opt = [];
    for (var i = 0; i < data.length; i++) {
        add_opt.push('<option value="' + data[i][0] + '">' + data[i][1] + '</option>');
    }
    var a_opt = add_opt.join('\n');
    select.append(a_opt);
}

//选择范围
function checkselect() {
    var product_select = $('#product_select');
    if (!product_select.val()) {
        jNotify("请选择业务");
    }
}

//选择业务
function changeselect() {
    var product_select = $('#product_select');
    var product_id = product_select.val();
    if (product_id) {
        $.ajax({
            type: "POST",
            url: "/product/ajax_get_group_option/",
            data: {
                'product_id': product_id
            },
            dataType: "json",
            error: function(XMLHttpRequest) {
                //alert(XMLHttpRequest.responseText);
                return false;
            },
            success: function(data) {
                makeoption(data, 'group_select');
            }
        });
    }
    else {
        $('#group_select .select-default').nextAll().remove();
    }
}

//文件发布
function ftp_upload() {
    var textfield = $("#file_show");
    var product_id = $('#product_select').val();
    var group_id = $('#group_select').val();
    var filepath = $('#file_path_hide').val();
    if (!product_id) {
        jNotify("请选择业务！");
        return false;
    } else if (!group_id) {
        jNotify("请选择范围！");
        return false;
    } else if (!filepath) {
        jNotify("请上传文件！");
        return false;
    } else {
        $("#upload_btn").button('loading');
        $.ajax({
            type: 'POST',
            url: '/product/ftp_upload/',
            dataType: 'json',
            data: {
                'filepath': filepath,
                'group_id': group_id
            },
            success: function(data) {
                if (data.result == 1) {
                    $('#file_uploaded').empty();
                    $('#file_md5').empty();
                    $('#file_path_hide').val('');
                    jSuccess(data.msg);
                } else {
                    jError(data.msg);
                }
                $("#upload_btn").button('complete').html("<span class='glyphicon glyphicon-cloud-upload'></span>发布公告");

            },
            error: function(data, status, e) {
                $("#upload_btn").button('complete').html("<span class='glyphicon glyphicon-cloud-upload'></span>发布公告");
                jError(e);
            }
        });
        $("#product_select .select-default, #group_select .select-default").prop("selected", true);
    }
}

//modify恢复默认
$("#modify_btn").off("click").on("click",function(){
    $("#modify_product_name .select-default").prop("selected",true);
    $("#modify_box").addClass('hide');
});

//set恢复默认
$("#set_btn").off("click").on("click",function(){
    $("#product_name option").eq(0).prop("selected",true);
    $("#announcement_form input").val('');
    $(".groupfirst").nextAll().remove();
});

//删除分组信息
$(document).on("click",".delete-group", function(){
    var ok = confirm("是否确认删除！"),
        that = $(this).parents(".form-group"),
        group_name = $(this).parents(".form-group").find("input[name=modify_group_name]");
    if(ok === true) {
        //ajax
        $.ajax({
            type: 'POST',
            url: '/product/delete/',
            data: {
                'group_id': group_name.attr('data-id'),
            },
            dataType: 'json',
            success: function(msg) {
                if (msg.result == 1) {
                    jSuccess('删除业务范围成功！');
                    that.remove();
                }else{
                    jError(msg.msg);
                }
            },
            error: function() {
                jError('删除业务范围失败！');
            }
        });
        return true;
    }
});

$(document).on("click",".delete-h", function(){
    $(this).parents(".form-group").remove();
});
