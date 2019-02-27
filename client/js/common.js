var host = 'http://localhost:3000';

// 全局对AJAX请求时进行配置。
$.ajaxSetup({
    // true允许跨域
    crossDomain: true,
    // 跨域时携带的身份信息，目的是让服务器端相信我是一个合法的请求。
    xhrFields: {
        withCredentials: true
    }
});

// 未登录时，跳转到登录页面
function checkLogin() {
    if (!$.cookie('account')) {
        location.href = '/user/login.html';
        return;
    }
}
function logout() {
    $.post(`${host}/users/logout`).done(function (data) {
        if (data.code == 200) {
            location.reload();
        }
    })
}

function getImgCode() {
    $.get(`${host}/users/captcha`).done(data => {
        $('#imgCode').html($(data).find('svg'))
    })
}

template.defaults.imports.dateFormat = function (date, format) {
    return moment(date).fromNow();
}

template.defaults.imports.dateFormat2 = function (date, format) {
    date = new Date(date);

    var map = {
        "M": date.getMonth() + 1, //月份 
        "D": date.getDate(), //日 
        "h": date.getHours(), //小时 
        "m": date.getMinutes(), //分 
        "s": date.getSeconds(), //秒 
        "q": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds() //毫秒 
    };
    format = format.replace(/([YMDhmsqS])+/g, function (all, t) {
        var v = map[t];
        if (v !== undefined) {
            if (all.length > 1) {
                v = '0' + v;
                v = v.substr(v.length - 2);
            }
            return v;
        }
        else if (t === 'Y') {
            return (date.getFullYear() + '').substr(4 - all.length);
        }
        return all;
    });
    return format;
};
