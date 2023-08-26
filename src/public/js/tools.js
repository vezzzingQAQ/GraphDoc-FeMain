// 获取指定名称的cookie
export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// 写入cookie
export function setCookie(name, data, expireTime) {
    let date = new Date();
    date.setTime(date.getTime() + expireTime);
    document.cookie = `${name}=${data}; expires=${date}`;
}

// 删除cookie
export function delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval = getCookie(name);
    if (cval != null) document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
}