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
    userRegister,
    userLogin,
    userLogout,
    showSaveToCloud,
    saveToCloud
} from "./event.js";

import mainAboutPng from "./../../asset/img/mainAbout.png";
import { getUserData, saveGraphToCloud } from "./serverCom.js";
import { getCookie } from "../../public/js/tools.js";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnReverseMode").addEventListener("click", () => {
        reverseColorMode();
    });
    document.querySelector("#btnToCloudSavsAs").addEventListener("click", () => {
        showSaveToCloud();
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
    document.querySelector(".userBlock").addEventListener("click", () => {
        if (!getCookie("jwt"))
            showLogin();
    });

    // 注册按钮
    document.querySelector("#register").addEventListener("click", () => {
        userRegister();
    });

    // 登录按钮
    document.querySelector("#login").addEventListener("click", () => {
        userLogin();
    });

    // 退出登录
    document.querySelector("#btnLogout").addEventListener("click", () => {
        userLogout();
    });

    // 保存到云
    document.querySelector("#saveToCloud").addEventListener("click", () => {
        saveToCloud(graph);
    });

    // 上来先获取下用户信息
    getUserData();
}