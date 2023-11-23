// 获取指定名称的cookie
export function getCookie(cname) {
    if (process.env.RUN_ENV == "web") {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
        }
        return "";
    } else {
        return window.localStorage.getItem(cname);
    }
}

// 写入cookie
export function setCookie(name, data, expireTime) {
    if (process.env.RUN_ENV == "web") {
        let date = new Date();
        date.setTime(date.getTime() + expireTime);
        document.cookie = `${name}=${data}; expires=${date}`;
    } else {
        // app用localStorage进行储存
        window.localStorage.setItem(name, data);
    }
}

// 删除cookie
export function delCookie(name) {
    if (process.env.RUN_ENV == "web") {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = getCookie(name);
        if (cval != null) document.cookie = name + "=" + cval + "; expires=" + exp.toGMTString();
    } else {
        window.localStorage.removeItem(name);
    }
}

// 获取get参数
export function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return decodeURI(pair[1]); }
    }
    return (false);
}

// 获取操作系统
export function getOS() {
    if (navigator.userAgent.indexOf("Window") > 0) {
        return "Windows";
    } else if (navigator.userAgent.indexOf("Mac OS X") > 0) {
        return "Mac";
    } else if (navigator.userAgent.indexOf("Linux") > 0) {
        return "Linux";
    } else {
        return "NUll";
    }
}

// 设置localStorage内容
export function setLocalStorage(key, data) {
    window.localStorage.setItem(key, data);
}

// 获取localStorage内容
export function getLocalStorage(key) {
    return window.localStorage.getItem(key) != "null" ? window.localStorage.getItem(key) : null;
}

// 删除指定localStorage
export function deleteLocalStorage(key) {
    window.localStorage.removeItem(key);
}

// map数值
export function numircMap(i, from, to, mapFrom, mapTo) {
    return (i - from) * (mapTo - mapFrom) / (to - from) + mapFrom;
}