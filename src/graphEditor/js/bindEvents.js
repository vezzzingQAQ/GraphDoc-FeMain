import {
    reverseColorMode,
    uploadToServer,
    saveGraph,
    exportSvg,
    exportPng,
    showAuthorList,
    openGraph,
    setGraphBackgroundColor,
    showLogin,
    showRegister,
    userRegister
} from "./event.js";

import mainAboutPng from "./../../asset/img/mainAbout.png";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnReverseMode").addEventListener("click", () => {
        reverseColorMode();
    });
    document.querySelector("#btnToJson").addEventListener("click", () => {
        uploadToServer(graph);
    });
    document.querySelector("#btnSave").addEventListener("click", () => {
        saveGraph(graph);
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        exportSvg(graph);
    });
    document.querySelector("#btnExport2").addEventListener("click", () => {
        exportPng(graph);
    });
    document.querySelector("#btnLogin").addEventListener("click", () => {
        showLogin();
    })
    document.querySelector("#btnRegister").addEventListener("click", () => {
        showRegister();
    })
    document.querySelector("#btnAuthorList").addEventListener("click", () => {
        showAuthorList();
    });
    document.querySelector("#openFile").addEventListener("click", () => {
        openGraph(graph);
    })
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        setGraphBackgroundColor(graph);
    });
    document.querySelector("#mainAboutImg").src = mainAboutPng;

    // 登录注册窗体互相跳转
    document.querySelector("#toRegister").addEventListener("click", () => {
        showRegister();
    });
    document.querySelector("#toLogin").addEventListener("click", () => {
        showLogin();
    });

    // 注册按钮
    document.querySelector("#register").addEventListener("click", () => {
        userRegister();
    })
}

/**
 * 设置右键菜单
 */
export function initRightMenu() { }