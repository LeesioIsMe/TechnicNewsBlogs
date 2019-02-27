
function bindType(data, index) {
    if (data instanceof Array) {
        var opts = `<option value="-1">请选择分类</option>`;
        if (data.length > 0) {
            var parentId = index == 1 ? 0 : $(`#type${index - 1}`).val() - 0;
            data.filter(v => v.parentId == parentId).forEach(v => {
                opts += `<option value="${v.id}">${v.typeName}</option>`;
            })
        }

        $(`#type${index}`).html(opts);
    }
}

$(function () {
    checkLogin();

    var categoryId = $.url().data.attr.query;
    categoryId == 1 ? $("#type2,#type3").css({ display: "inline-block" }) : $("#type2,#type3").css({ display: "none" });
    console.log(categoryId);
    // 3. 编写代码渲染视图
    console.log(editor.txt.html())

    var categories = [];
    $.get(`${host}/categories/getCategories`).done(function (data) {
        // console.log(data);
        if (data.code != 200) {
            layer.alert(data.message, { icon: 2, title: '提示' });
            return;
        }
        categories = data.categories;

        bindType(categories, 1);
        bindType(categories, 2);
        bindType(categories, 3);
        $("#type1 option").each(function (i, e) {
            if ($(e).val() == categoryId) {
                $(e).prop("selected", true);
                bindType(categories, 2);
            }
        })
    })
    $('#type1').on('change', function () {
        $(this).val() == 1 ? $("#type2,#type3").css({ display: "inline-block" }) : $("#type2,#type3").css({ display: "none" });
        bindType(categories, 2);
    })

    $('#type2').on('change', function () {
        bindType(categories, 3);
    })

    $('#postForm').submit(function (ev) {
        ev.preventDefault();
        $.post(`${host}/articles/postArticle`, {
            type1: $('#type1').val(),
            type2: $('#type2').val(),
            type3: $('#type3').val(),
            title: $('#title').val(),
            content: editor.txt.html(),
            summary: $("#summary").val()
        }).done(function (data) {
            console.log(data)
            if (data.code != 200) {
                layer.alert(data.message, { icon: 2, title: '提示' });
                return;
            }
            layer.alert(data.message, { icon: 1, title: '提示' });
        })
    })
})
