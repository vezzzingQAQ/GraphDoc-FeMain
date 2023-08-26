/**
 * 用来提供各种事件
 * by vezzzing 2023.8.23
 * z z z studio
 */

import axios from "axios";
import { Graph, LoadGraphFromJson } from "./graph/graph";
import { saveAs } from 'file-saver';
import { USER_LOGIN, USER_REGISTER } from "./graph/urls";


// 界面色彩配置
let darkMode = true;

/**
 * 反转界面色彩风格
 */
export function reverseColorMode() {
    darkMode = !darkMode;
    if (darkMode) {
        document.querySelector(".mainWindow").classList = "mainWindow darkMode";
    } else {
        document.querySelector(".mainWindow").classList = "mainWindow lightMode";
    }
}

/**
 * 导出为JSON，上传服务器
 */
export function uploadToServer(graph) {
    console.log(graph.toJson());
}

/**
 * 保存到本地
 */
export function saveGraph(graph) {
    let blob = new Blob([graph.toJson()]);
    saveAs(blob, +new Date() + ".vgd");
}

/**
 * 导出为SVG
 */
export function exportSvg(graph) {
    graph.exportSvg();
}

/**
 * 导出为PNG
 */
export function exportPng(graph) {
    graph.exportPng();
}

/**
 * 展示中央窗体
 */
export function showAuthorList() {
    showCenterWindow(document.querySelector("#windowAuthorList"));
}
export function showLogin() {
    showCenterWindow(document.querySelector("#windowLogin"));
}
export function showRegister() {
    showCenterWindow(document.querySelector("#windowRegister"))
}

function showCenterWindow(selector) {
    selector.style.opacity = 1;
    selector.style.pointerEvents = "all";
    selector.style.transition = "0.3s ease-in-out";
    // 绑定关闭事件
    selector.querySelector(".centerWindowCloseBtn").onclick = function () {
        hideCenterWindow(selector);
    }
    selector.querySelector(".close").addEventListener("click", function () {
        hideCenterWindow(selector);
    });
}

function hideCenterWindow(selector) {
    selector.style.opacity = 0;
    selector.style.pointerEvents = "none";
}

/**
 * 从本地打开导图文件
 */
export function openGraph(graph) {
    let elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            let reader;
            let data;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                graph.clear();
                data = JSON.parse(readRes.target.result);
                graph.load(data);
            });
            reader.addEventListener("error", () => {
                alert("打开文件失败");
            });
        } catch {
            console.error("打开文件出错");
        }
    })
}

/**
 * 设置导图背景颜色
 */
export function setGraphBackgroundColor(graph) {
    graph.setBgColor(document.querySelector("#bgColorInput").value);
}

/**
 * 用户注册
 */
export function userRegister() {
    let username = document.querySelector("#register_username").value;
    let password1 = document.querySelector("#register_password1").value;
    let password2 = document.querySelector("#register_password2").value;
    if (password1 != password2) {
        alert("两次密码不相等");
        return;
    }
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password1);
    axios({
        url: USER_REGISTER,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(d => {
        if (d.data.state == 1) {
            // 跳转登录
            hideCenterWindow(document.querySelector("windowRegister"));
            showLogin();
        }
    })
}

/**
 * 用户登录
 */
export function userLogin() {
    let username = document.querySelector("#login_username").value;
    let password = document.querySelector("#login_password").value;
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    axios({
        url: USER_LOGIN,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(d => {
        console.log(d.data);
    })
}