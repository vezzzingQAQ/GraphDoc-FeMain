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
    showTemplate,
    restartSim,
    openCode,
    hideDyaTemplateArea,
    showTemplateDya,
    showGraphProperty,
    fullScreen,
    refreshFullScreen,
    refreshAlignBlock,
    refreshEditMode,
    exportJpg,
    initNodeAddWindow,
    showShareLink,
    refreshAddNodeArea,
    showBugReport,
    recalSize,
    showImgExport,
    showMessage,
    refreshShowCoord,
    bindFileDropEvent,
    extractAllNode,
    refreshGraph,
    refreshNodeTemplate,
    exportJsonLd,
    refreshShowGrid
} from "./event.js";

import mainAboutPng from "./../../asset/img/mainAbout.png";
import payJpg from "./../../asset/img/pay.jpg";
import wcAvatarJpg from "./../../asset/img/wcAvatar.jpg";
import loadingImg from "./../../asset/img/icon/icon.ico";
import { getUserData, loadGraphFromCloud, saveGraphToCloud } from "../../public/js/serverCom.js";
import { getCookie } from "../../public/js/tools.js";
import { VGraph, VNode, VEdge, bindData } from "./graph/genJson";
import { PUBLIC_PAGE } from "../../public/js/urls.js";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export async function bindEvents(graph) {
    document.querySelector("#toPublicPage").addEventListener("click", () => {
        window.open(PUBLIC_PAGE);
    });
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
    document.querySelector("#btnLoadFromCode").addEventListener("click", () => {
        openCode(graph);
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        exportSvg(graph);
    });
    document.querySelector("#btnExport2").addEventListener("click", () => {
        showImgExport(graph, "png");
    });
    document.querySelector("#btnExport3").addEventListener("click", () => {
        showImgExport(graph, "jpg");
    });
    document.querySelector("#btnJsonLd").addEventListener("click", () => {
        exportJsonLd(graph);
    });
    document.querySelector("#btnLogin").addEventListener("click", () => {
        showLogin();
    });
    document.querySelector("#btnRegister").addEventListener("click", () => {
        showRegister();
    });
    document.querySelector("#btnAuthorList").addEventListener("click", () => {
        showAuthorList();
    });
    document.querySelector("#btnPay").addEventListener("click", () => {
        showPay();
    });
    document.querySelector("#btnPayLongBtn").addEventListener("click", () => {
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

    // 点击用户头像或者名字登录
    document.querySelector("#showUsername").addEventListener("click", () => {
        if (!getCookie("jwt"))
            showLogin();
    });
    document.querySelector("#showUserAvatar").addEventListener("click", () => {
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
    });

    // 保存到云
    document.querySelector("#saveToCloud").addEventListener("click", () => {
        saveToCloud(graph);
    });

    // 点击用户头像跳转用户页
    document.querySelector("#showUsername").addEventListener("click", () => {
        if (userConfig.isLogin)
            toUserPage();
        else
            showLogin();
    });
    document.querySelector("#showUserAvatar").addEventListener("click", () => {
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

    // 从动态模板新建图谱
    document.querySelector("#btnTemplateDya").addEventListener("click", () => {
        showTemplateDya(graph);
    });


    // 重启物理模拟
    document.querySelector("#physicsSimBtn").addEventListener("click", () => {
        restartSim(graph);
    });

    // 设置图谱属性
    document.querySelector("#btnSetGraphProperty").addEventListener("click", () => {
        showGraphProperty();
    });

    // 全屏浏览
    document.querySelector("#fullScreenBtn").addEventListener("click", () => {
        refreshFullScreen(graph);
    });

    // 切换编辑/浏览模式
    document.querySelector("#editGraphBtn").addEventListener("click", () => {
        refreshEditMode(graph);
    });

    // 对齐格点
    document.querySelector("#btnRefreshAlignBlock").addEventListener("click", () => {
        refreshAlignBlock(graph, !document.querySelector("#check_alignBlock").hasAttribute("checked"));
    });

    // 显示坐标系
    document.querySelector("#btnRefreshShowCoord").addEventListener("click", () => {
        refreshShowCoord(graph, !document.querySelector("#check_showCoord").hasAttribute("checked"));
    });

    // 显示格子点
    document.querySelector("#btnRefreshShowGrid").addEventListener("click", () => {
        refreshShowGrid(graph, !document.querySelector("#check_showGrid").hasAttribute("checked"));
    })


    // 分享图谱
    document.querySelector("#btnShare").addEventListener("click", () => {
        showShareLink();
    });

    // 展开收起节点添加面板
    document.querySelectorAll(".slideUpBtn").forEach(ele => ele.addEventListener("click", () => {
        refreshAddNodeArea(ele.parentElement.parentElement.id);
    }));

    // bug反馈窗口
    document.querySelector("#btnBugReport").addEventListener("click", () => {
        showBugReport();
    });

    // 提取所有节点关键词
    document.querySelector("#btnExtractAll").addEventListener("click", () => {
        extractAllNode(graph);
    });

    // 刷新图谱
    document.querySelector("#btnRefresh").addEventListener("click", () => {
        refreshGraph(graph);
    });


    // 窗体大小改变时自动缩放画布
    window.addEventListener("resize", () => {
        recalSize(graph)
    });

    // 上来先获取下用户信息
    let userData = await getUserData();
    refreshUserData(userData);

    // 加载图片
    document.querySelector("#mainAboutImg").src = mainAboutPng;
    document.querySelector("#payImg").src = payJpg;
    document.querySelector("#wcAvatarImg").src = wcAvatarJpg;
    document.querySelector("#loadingImg").src = loadingImg;

    // 菜单栏设置：点击直接进行checkbox选择
    document.querySelectorAll(".checkBoxContainer").forEach(ele => {
        let domChildInput = ele.querySelector("input");
        ele.addEventListener("click", (e) => {
            e.preventDefault();
            if (domChildInput.hasAttribute("checked")) {
                domChildInput.removeAttribute("checked");
            } else {
                domChildInput.setAttribute("checked", true);
            }
        });
    });

    // 节点添加窗口
    initNodeAddWindow(graph);

    // 自定义模板窗口
    refreshNodeTemplate(graph);

    // 隐藏动态组件
    hideDyaTemplateArea();

    // 定制全局作用名
    window.VGraph = VGraph;
    window.VNode = VNode;
    window.VEdge = VEdge;
    window.bindData = bindData;

    if (process.env.RUN_ENV == "app") {
        // app版本特化
        document.querySelector("#btnUserPage").style.display = "none";
    } else {
        // web版本
        document.querySelectorAll(".showInApp").forEach(ele => {
            ele.style.display = "none";
        });
    }

    // 联网检测
    window.addEventListener("offline", () => {
        // 掉线
        showMessage("网络断开，请及时保存图谱");
    });

    // 图片上传
    bindFileDropEvent(graph);
}