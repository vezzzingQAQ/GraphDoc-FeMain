/**
 * 计算字符串的显示长度
 * 
 * by vezzzing 2023.8.10
 * z z z studio
 */

function isChinese(char) {
    var re = /[^\u4E00-\u9FA5]/;
    if (re.test(char)) return false;
    return true;
}

export function calLength(str) {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
        if (isChinese(str[i])) {
            len += 2;
        } else {
            len += 1.5;
        }
    }
    return len;
}
