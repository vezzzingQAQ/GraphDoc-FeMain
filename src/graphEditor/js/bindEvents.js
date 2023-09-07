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
    saveToCloud,
    showLoadFromCloud,
    refreshUserData,
    toUserPage,
    userConfig,
    newGraph,
    showPay,
    showTemplate
} from "./event.js";

import mainAboutPng from "./../../asset/img/mainAbout.png";
import payJpg from "./../../asset/img/pay.jpg";
import { getUserData, loadGraphFromCloud, saveGraphToCloud } from "../../public/js/serverCom.js";
import { getCookie } from "../../public/js/tools.js";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export async function bindEvents(graph) {
    document.querySelector("#btnReverseMode").addEventListener("click", () => {
        reverseColorMode();
    });
    document.querySelector("#btnSave").addEventListener("click", () => {
        saveGraph(graph);
    });
    document.querySelector("#btnToCloudSavsAs").addEventListener("click", () => {
        showSaveToCloud();
    });
    document.querySelector("#btnLoadFromCloud").addEventListener("click", () => {
        showLoadFromCloud(graph);
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
    document.querySelector("#btnPay").addEventListener("click", () => {
        showPay();
    });
    document.querySelector("#openFile").addEventListener("click", () => {
        openGraph(graph);
    })
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        setGraphBackgroundColor(graph);
    });

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

    // 跳转用户中心
    document.querySelector("#btnUserPage").addEventListener("click", () => {
        toUserPage();
    })

    // 保存到云
    document.querySelector("#saveToCloud").addEventListener("click", () => {
        saveToCloud(graph);
    });

    // 点击用户头像跳转用户页
    document.querySelector(".userBlock").addEventListener("click", () => {
        if (userConfig.isLogin)
            toUserPage();
        else
            showLogin();
    });

    // 新建图谱
    document.querySelector("#btnNew").addEventListener("click", () => {
        newGraph(graph);
    });

    // 从模板新建图谱
    document.querySelector("#btnTemplate").addEventListener("click", () => {
        showTemplate(graph);
    });

    // 上来先获取下用户信息
    let userData = await getUserData();
    refreshUserData(userData);

    // 加载图片
    document.querySelector("#mainAboutImg").src = mainAboutPng;
    document.querySelector("#payImg").src = payJpg;
}