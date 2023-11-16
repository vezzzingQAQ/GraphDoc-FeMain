/**
 * 用来提供各种事件
 * by vezzzing 2023.8.23
 * z z z studio
 */

import axios from "axios";
import { saveAs } from 'file-saver';
import { EDITOR_PGAE, GRAPH_SVG_UPLOAD_PATH, USER_AVATAR_ROOT, USER_DATA, USER_LOGIN, USER_REGISTER, GRAPH_PNG_STORE_PATH, USER_PAGE, AVATAR_STORE_PATH, DOMAIN_FE, IMG_UPLOAD_PATH, NODE_UPLOAD_PATH, NODE_STORE_PATH } from "../../public/js/urls";
import { delCookie, deleteLocalStorage, getCookie, getLocalStorage, getQueryVariable, setCookie, setLocalStorage } from "../../public/js/tools";
import { configGraph, deleteGraph, getBlobContent, getUserData, listUserGraph, loadGraphConfig, loadGraphFromCloud, loginUser, registerUser, saveGraphSvgToCloud, saveGraphToCloud, uploadNodeBlob, uploadStaticFile } from "../../public/js/serverCom";
import defaultAvatarPng from "./../../asset/img/defaultAvatar.png";
import newGraphJson from "./../../asset/graph/new.json";
import { templateList } from "./templateList";
import { templateDyaList } from "./templateDyaList";
import { LEFT_PAN_ADD_NODE_LIST, imgInNode } from "./nodeAddList";
import { loadingTipList } from "./loadgingTipList";
import { doCmd } from "./graph/cmdList";

let currentGraph = null;

// 用户配置
export let userConfig = {
    isDark: true,
    isLogin: false,
    currentGraphFileName: "",
    username: null,
    uid: null,
    isFullScreen: false,
    isEditMode: true
}

/**
 * 反转界面色彩风格
 */
export function reverseColorMode() {
    userConfig.isDark = !userConfig.isDark;
    if (userConfig.isDark) {
        document.querySelector(".mainWindow").classList = "mainWindow darkMode";
    } else {
        document.querySelector(".mainWindow").classList = "mainWindow lightMode";
    }
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
export function exportPng(graph, scale = 12) {
    graph.exportPng(scale);
}

/**
 * 导出为JPG
 */
export function exportJpg(graph, scale = 12) {
    graph.exportJpg(scale);
}

/**
 * 从本地打开导图文件
 */
export function openGraph(graph) {
    let elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.accept = ".vgd";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            // 断开socket连接
            if (graph.socketOn) {
                document.querySelector("#check_openSocket").removeAttribute("checked");
                graph.stopSocket();
            }
            let reader;
            let data;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                showLoadingPage();
                window.setTimeout(() => {
                    graph.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                    refreshGraphName(graph);
                    graph.clear();
                    data = JSON.parse(readRes.target.result);
                    graph.load(data, true);
                    hideDyaTemplateArea();
                }, 1);
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
 * 新建导图
 */
export function newGraph(graph) {
    // 断开socket连接
    if (graph.socketOn) {
        document.querySelector("#check_openSocket").removeAttribute("checked");
        graph.stopSocket();
    } v
    graph.currentGraphFileName = "未命名图谱";
    refreshGraphName(graph);
    graph.clear();
    graph.load(newGraphJson, true);
    hideDyaTemplateArea();
}

/**
 * 设置导图背景颜色
 */
export function setGraphBackgroundColor(graph, cmd) {
    graph.setBgColor(document.querySelector("#bgColorInput").value, cmd);
}

/**
 * 用户注册
 */
export async function userRegister() {
    let username = document.querySelector("#register_username").value;
    let password1 = document.querySelector("#register_password1").value;
    let password2 = document.querySelector("#register_password2").value;
    let email = document.querySelector("#register_email").value;
    if (password1 != password2) {
        document.querySelector("#password_conflict").classList = "hint show";
        return;
    }
    let registerData = await registerUser(username, password1, email);
    if (registerData.state == 1) {
        // 跳转登录
        hideCenterWindow(document.querySelector("#windowRegister"));
        showLogin();
    } else if (registerData.state == 0) {
        document.querySelector("#user_name_exist").classList = "hint show";
    }
}

/**
 * 用户登录
 */
export async function userLogin() {
    let username = document.querySelector("#login_username").value;
    let password = document.querySelector("#login_password").value;
    let loginData = await loginUser(username, password);
    if (loginData.state == 1) {
        setCookie('jwt', loginData.jwt, 1000 * 60 * 60 * 1000);
        // 获取用户信息进行显示
        let userData = await getUserData();
        refreshUserData(userData);
        hideCenterWindow(document.querySelector("#windowLogin"));
    } else if (loginData.state == 2) {
        document.querySelector("#login_password").value = "";
        document.querySelector("#hint_password_incorrect").classList = "hint show";
    } else if (loginData.state == 3) {
        document.querySelector("#login_username").value = "";
        document.querySelector("#login_password").value = "";
        document.querySelector("#hint_user_not_exist").classList = "hint show";
    }
}

/**
 * 用户退出
 */
export async function userLogout(graph) {
    // 断开socket连接
    if (graph.socketOn) {
        document.querySelector("#check_openSocket").removeAttribute("checked");
        graph.stopSocket();
    }
    delCookie("jwt");
    let userData = await getUserData();
    refreshUserData(userData);
}

/**
 * 另存到云
 */
export function saveToCloud(graph) {
    let name = document.querySelector("#stc_path").value;
    let svg = graph.genSvg();

    // 先上传图片
    let domFileInput = document.createElement("input");
    domFileInput.type = "file";

    document.querySelector("#saveToCloud").innerHTML = "保存中...";

    // 多次保存
    let repeatNum = 0;
    let saveInterval = window.setInterval(async () => {
        if (repeatNum < 5) {
            let svgData = await saveGraphSvgToCloud(svg);
            if (name) {
                // 保存到云
                let data = graph.toJson();
                let saveFileData = await saveGraphToCloud(data, name, svgData.msg.filename);
                if (saveFileData.state == 11 || saveFileData.state == 10) {
                    graph.currentGraphFileName = name;
                    refreshGraphName(graph);
                    hideCenterWindow(document.querySelector("#windowSaveToCloud"))
                }
            }
        } else {
            window.clearInterval(saveInterval);
        }
        repeatNum++;

    }, 300);
}

/**
 * 根据是否登录更新窗体
 */
export function refreshMenu() {
    if (userConfig.isLogin) {
        document.querySelector("#btnLogin").classList = "hide";
        document.querySelector("#btnRegister").classList = "hide";
        document.querySelector("#btnLogout").classList = "show";
        if (process.env.RUN_ENV == "web")
            document.querySelector("#btnUserPage").classList = "show";
        document.querySelector("#btnToCloudSavsAs").classList = "show";
        document.querySelector("#btnLoadFromCloud").classList = "show";
        document.querySelector("#btnSetGraphProperty").classList = "show";
    } else {
        document.querySelector("#btnLogin").classList = "show";
        document.querySelector("#btnRegister").classList = "show";
        document.querySelector("#btnLogout").classList = "hide";
        document.querySelector("#btnUserPage").classList = "hide";
        document.querySelector("#btnToCloudSavsAs").classList = "hide";
        document.querySelector("#btnLoadFromCloud").classList = "hide";
        document.querySelector("#btnSetGraphProperty").classList = "hide";
    }
}

/**
 * 更新导图名称
 */
export function refreshGraphName(graph) {
    if (graph.currentGraphFileName) {
        document.querySelector("#graphName").innerHTML = graph.currentGraphFileName;
        window.history.replaceState("", "", `${EDITOR_PGAE}`);
    }
}

/**
 * 更新用户信息
 */
export function refreshUserData(data) {
    if (data.state == 1) {
        document.querySelector("#showUsername").innerHTML = data.msg.data.username;
        document.querySelector("#showUserAvatar").src = `${AVATAR_STORE_PATH}${data.msg.data.avatar}`;
        userConfig.isLogin = true;
        userConfig.username = data.msg.data.username;
        userConfig.uid = data.msg.data.id;
        refreshMenu();
    } else {
        document.querySelector("#showUsername").innerHTML = "未登录";
        document.querySelector("#showUserAvatar").src = defaultAvatarPng;
        userConfig.isLogin = false;
        userConfig.username = null;
        refreshMenu();
    }
}

/**
 * 跳转个人主页
 */
export function toUserPage() {
    if (process.env.RUN_ENV == "web") {
        window.open(`${USER_PAGE}?uid=${userConfig.uid}&username=${userConfig.username}`);
    }
}

/**
 * 重启物理模拟
 */
export function restartSim(graph) {
    graph.renderProperties.simulation.stop();
    graph.modifyNodePhysics();
    graph.modifyEdgePhysics();
    graph.renderProperties.simulation.alphaTarget(0.02).restart();
}

/**
 * 从本地打开代码片段
 */
export function openCode(graph) {
    let elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.accept = ".js";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            // 断开socket连接
            if (graph.socketOn) {
                document.querySelector("#check_openSocket").removeAttribute("checked");
                graph.stopSocket();
            }
            showLoadingPage();
            let reader;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                graph.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                refreshGraphName(graph);
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
                    document.querySelector(".dyaTemplateArea").style.display = "none";
                    let codeEval = `
                    ${readRes.target.result};
                    try{
                    bind();
                    }catch{}
                    window.main=main;
                    window.graphData=main();
                    `;
                    eval(codeEval);

                    graph.clear();
                    let data = JSON.parse(window.graphData.toJson());
                    graph.load(data, true);
                    currentGraph = graph;
                } catch (e) {
                    hideLoadingPage();
                    showCodeError(e.message);
                }
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
 * 从本地代码加载
 */
export function loadGraphFromCode() {
    // 数据绑定的部分不需要重新执行
    try {
        // 断开socket连接
        if (graph.socketOn) {
            document.querySelector("#check_openSocket").removeAttribute("checked");
            graph.stopSocket();
        }
        eval("window.graphData=window.main();");
        currentGraph.clear();
        let data = JSON.parse(window.graphData.toJson());
        currentGraph.load(data);
    } catch (e) {
        showCodeError(e.message);
    }
}

/**
 * 全屏浏览
 */
export function refreshFullScreen(graph, refresh = true) {
    if (refresh)
        userConfig.isFullScreen = !userConfig.isFullScreen;
    if (userConfig.isFullScreen) {
        // 全屏模式
        graph.renderProperties.svg
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
        document.querySelector(".displayArea").style.zInde = 9999;
        document.querySelector(".mainMenu").style.zIndex = -1;
        document.querySelector(".topArea").style.top = "5px";
        document.querySelector(".panArea").style.display = "none";
        document.querySelector(".dyaTemplateArea").style.display = "none";
        document.querySelector(".leftBarArea").style.display = "none";
        document.querySelector("#fullScreenBtn").innerHTML = `| 全屏模式<i class="fa fa-cube"></i>`;
    } else {
        // 窗口模式
        graph.renderProperties.svg
            .attr("width", document.querySelector(".displayArea").offsetWidth)
            .attr("height", document.querySelector(".displayArea").offsetHeight)
        document.querySelector(".displayArea").style.zInde = 1;
        document.querySelector(".mainMenu").style.zIndex = 99;
        document.querySelector(".topArea").style.top = document.querySelector(".mainMenu").offsetHeight + 5 + "px";
        document.querySelector(".panArea").style.display = "block";
        document.querySelector(".leftBarArea").style.display = "flex";
        document.querySelector("#fullScreenBtn").innerHTML = `| 窗口模式<i class="fa fa-cube"></i>`;
    }
}

/**
 * 切换编辑/浏览模式
 */
export function refreshEditMode(graph) {
    if (userConfig.isEditMode) {
        graph.locked = true;
        graph.reload();
        document.querySelector("#editGraphBtn").innerHTML = `| 锁定模式<i class="fa fa-lock"></i>`;
    } else {
        graph.locked = false;
        graph.reload();
        document.querySelector("#editGraphBtn").innerHTML = `| 编辑模式<i class="fa fa-edit"></i>`;
    }
    window.setTimeout(() => {
        refreshFullScreen(graph, false);
    }, 300);
    userConfig.isEditMode = !userConfig.isEditMode;
}

/**
 * 启用/撤销格点吸附模式
 */
export function refreshAlignBlock(graph, value) {
    if (value)
        graph.alignBlock = true
    else
        graph.alignBlock = false;
}

/**
 * 刷新是否显示坐标系
 */
export function refreshShowCoord(graph, value) {
    graph.refreshCoord(value);
}

/**
 * 刷新是否显示格子点
 */
export function refreshShowGrid(graph, value) {
    graph.refreshGrid(value);
}

/**
 * 从模板添加节点
 */
function addTpNode(nodeTp, graph) {
    graph.addNodeFromString(nodeTp.nodeString);
}

/**
 * 加载节点添加列表
 */
export function initNodeAddWindow(graph) {
    let domContainer = document.querySelector("#addNodeArea ul");
    for (let i = 0; i < LEFT_PAN_ADD_NODE_LIST.length; i++) {
        let currentNodeTp = LEFT_PAN_ADD_NODE_LIST[i];
        let nodeContainer = document.createElement("li");
        nodeContainer.style.backgroundImage = `url(./nodeTp/${currentNodeTp.name}.png)`;
        nodeContainer.title = currentNodeTp.showName;
        nodeContainer.onclick = function () {
            addTpNode(currentNodeTp, graph);
        }
        domContainer.appendChild(nodeContainer);
    }
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
    showCenterWindow(document.querySelector("#windowRegister"));
}
export function showPay() {
    showCenterWindow(document.querySelector("#windowPay"));
}
export function showBugReport() {
    showCenterWindow(document.querySelector("#windowBugReport"));
}
export function showCodeError(message) {
    showCenterWindow(document.querySelector("#windowCodeError"));
    document.querySelector("#codeErrorShow").innerHTML = message;
    document.querySelector("#closeCodeError").onclick = () => {
        hideCenterWindow(document.querySelector("#windowCodeError"));
    }
}
export function showMessage(message, afterFn = () => { }) {
    showCenterWindow(document.querySelector("#windowShowMessage"));
    document.querySelector("#msgShowArea").innerHTML = message;
    document.querySelector("#msgAccept").onclick = () => {
        afterFn();
        hideCenterWindow(document.querySelector("#windowShowMessage"));
    }
}
export function showImgExport(graph, type) {
    showCenterWindow(document.querySelector("#windowExportImg"));
    document.querySelector("#btnImgExport").innerHTML = "导出";
    document.querySelector("#exportImgScale").value = "";
    document.querySelector("#btnImgExport").onclick = function () {
        let scale = document.querySelector("#exportImgScale").value;
        if (type == "jpg") {
            exportJpg(graph, scale);
        } else if (type == "png") {
            exportPng(graph, scale);
        }
        document.querySelector("#btnImgExport").innerHTML = "导出中...";
        window.setTimeout(() => {
            hideCenterWindow(document.querySelector("#windowExportImg"));
        }, 500);
    }
}
export async function showShareLink(graph) {
    showCenterWindow(document.querySelector("#windowShareLink"));
    // 获取数据填入窗体
    let response = await loadGraphConfig(graph.currentGraphFileName);
    if (response.state == 1) {
        let graphName = response.msg.name;
        let uid = response.msg.author.id;
        let url = `${EDITOR_PGAE}?graphName=${encodeURI(graphName)}&uid=${uid}&fs=true&lc=true`;
        document.querySelector("#linkShowArea").href = url;
        document.querySelector("#linkShowArea").innerHTML = url;
    } else {
        hideCenterWindow(document.querySelector("#windowShareLink"));
        showMessage("请先保存到云再分享");
    }
}
export async function showGraphProperty(graph) {
    showCenterWindow(document.querySelector("#windowGraphProperty"));
    // 获取数据填入窗体
    let response = await loadGraphConfig(graph.currentGraphFileName);
    if (response.state == 1) {
        if (response.msg.isPublic) {
            document.querySelector("#radioPublic").checked = true;
        } else {
            document.querySelector("#radioPrivate").checked = true;
        }
        document.querySelector("#graphInfoInput").value = response.msg.info;
    }
    document.querySelector("#updateGraphProperty").onclick = async () => {
        let isPublic = 0;
        if (document.querySelector("#radioPublic").checked) isPublic = 1;
        let info = document.querySelector("#graphInfoInput").value;
        // 发送请求
        response = await configGraph(graph.currentGraphFileName, isPublic, info);
        if (response.state == 1) {
            hideCenterWindow(document.querySelector("#windowGraphProperty"));
        } else {
            hideCenterWindow(document.querySelector("#windowGraphProperty"));
            showMessage("请先保存到云再设置");
        }
    }
}
export function showTextEditor(toDom, fnChange = () => { }, fnDone = () => { }) {
    showCenterWindow(document.querySelector("#windowTextEditor"));
    document.querySelector("#textEditorTextarea").value = toDom.value;
    document.querySelector("#textEditorTextarea").oninput = () => {
        toDom.value = document.querySelector("#textEditorTextarea").value;
        fnChange(toDom.value);
    }
    document.querySelector("#textEditorTextarea").onkeydown = function (e) {
        if (e.keyCode == 9) {
            let position = this.selectionStart + 2;
            this.value = this.value.substr(0, this.selectionStart) + '  ' + this.value.substr(this.selectionStart);
            this.selectionStart = position;
            this.selectionEnd = position;
            this.focus();
            e.preventDefault();
        }
    };
    document.querySelector("#editTextFinish").onclick = () => {
        hideCenterWindow(document.querySelector("#windowTextEditor"));
        fnDone();
    }
}

/**
 * 保存到云
 */
export async function showSaveToCloud() {
    document.querySelector("#saveToCloud").innerHTML = "保存";
    document.querySelector("#windowSaveToCloud ul").innerHTML = "";
    let graphList = (await listUserGraph()).msg;
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domIsPublicTag;
        if (currentGraph.isPublic) {
            domIsPublicTag = document.createElement("i");
            domIsPublicTag.classList = "fa fa-eye showBlockTag";
        }
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = () => {
            showMessage(`确定要删除 ${currentGraph.name} 吗`, async () => {
                let response = await deleteGraph(currentGraph.name);
                if (response.state == 1) {
                    domGraphTagClose.remove();
                    domGraphTagDate.remove();
                    domGraphTagName.remove();
                    domGraphTag.remove();
                }
            });
        };
        domGraphTag.appendChild(domGraphTagImg);
        if (currentGraph.isPublic)
            domGraphTag.appendChild(domIsPublicTag);
        domGraphTag.appendChild(domGraphTagName);
        domGraphTag.appendChild(domGraphTagDate);
        domGraphTag.appendChild(domGraphTagClose);

        domGraphTag.addEventListener("click", () => {
            document.querySelector("#stc_path").value = currentGraph.name;
            document.querySelector("#saveToCloud").innerHTML = "覆盖";
        });
        document.querySelector("#windowSaveToCloud ul").appendChild(domGraphTag);
    }
    document.querySelector("#stc_path").addEventListener("input", () => {
        for (let graph of graphList) {
            if (graph.name == document.querySelector("#stc_path").value) {
                document.querySelector("#saveToCloud").innerHTML = "覆盖";
            } else {
                document.querySelector("#saveToCloud").innerHTML = "保存";
            }
        }
    });
    showCenterWindow(document.querySelector("#windowSaveToCloud"));
}


/**
 * 从云打开
 */
export async function showLoadFromCloud(graph) {
    document.querySelector("#windowLoadFromCloud ul").innerHTML = "";
    let graphList = (await listUserGraph()).msg;
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domIsPublicTag;
        if (currentGraph.isPublic) {
            domIsPublicTag = document.createElement("i");
            domIsPublicTag.classList = "fa fa-eye showBlockTag";
        }
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = () => {
            showMessage(`确定要删除 ${currentGraph.name} 吗`, async () => {
                let response = await deleteGraph(currentGraph.name);
                if (response.state == 1) {
                    domGraphTagClose.remove();
                    domGraphTagDate.remove();
                    domGraphTagName.remove();
                    domGraphTag.remove();
                }
            });
        };
        domGraphTag.appendChild(domGraphTagImg);
        if (currentGraph.isPublic)
            domGraphTag.appendChild(domIsPublicTag);
        domGraphTag.appendChild(domGraphTagName);
        domGraphTag.appendChild(domGraphTagDate);
        domGraphTag.appendChild(domGraphTagClose);

        domGraphTagName.onclick = async () => {
            // 断开socket连接
            if (graph.socketOn) {
                document.querySelector("#check_openSocket").removeAttribute("checked");
                graph.stopSocket();
            }
            showLoadingPage();
            let response = await loadGraphFromCloud(currentGraph.name);
            if (response.state == 1) {
                graph.currentGraphFileName = currentGraph.name;
                refreshGraphName(graph);
                let json = response.msg;
                graph.clear();
                graph.load(JSON.parse(json), true);
                hideDyaTemplateArea();
                hideCenterWindow(document.querySelector("#windowLoadFromCloud"));
            }
        };
        document.querySelector("#windowLoadFromCloud ul").appendChild(domGraphTag);
    }
    showCenterWindow(document.querySelector("#windowLoadFromCloud"));
}

/**
 * 从范例新建
 */
export function showTemplate(graph) {
    let domAddedContainer = document.createElement("ul");
    for (let template of templateList) {
        let domAddedLi = document.createElement("li");
        domAddedLi.onclick = () => {
            // 断开socket连接
            if (graph.socketOn) {
                document.querySelector("#check_openSocket").removeAttribute("checked");
                graph.stopSocket();
            }
            showLoadingPage();
            graph.currentGraphFileName = template.showName;
            refreshGraphName(graph);
            // 请求本地文件
            axios.get(`./graphTemplate/${template.name}.vgd`).then(res => {
                graph.clear();
                graph.load(res.data, true);
                hideDyaTemplateArea();
                hideCenterWindow(document.querySelector("#windowTemplate"));
            });
        }
        let domAddedImg = document.createElement("img");
        domAddedImg.src = `./graphTemplate/${template.name}.png`;
        let domAddedP = document.createElement("p");
        domAddedP.innerHTML = template.showName;
        domAddedLi.appendChild(domAddedImg);
        domAddedLi.appendChild(domAddedP);
        domAddedContainer.appendChild(domAddedLi);
    }
    document.querySelector("#windowTemplate .content").innerHTML = "";
    document.querySelector("#windowTemplate .content").appendChild(domAddedContainer);
    showCenterWindow(document.querySelector("#windowTemplate"));
}

/**
 * 从模板新建
 */
export function showTemplateDya(graph) {
    let domAddedContainer = document.createElement("ul");
    for (let template of templateDyaList) {
        let domAddedLi = document.createElement("li");
        domAddedLi.onclick = () => {
            // 断开socket连接
            if (graph.socketOn) {
                document.querySelector("#check_openSocket").removeAttribute("checked");
                graph.stopSocket();
            }
            showLoadingPage();
            graph.currentGraphFileName = template.showName;
            refreshGraphName(graph);
            // 请求本地文件
            axios.get(`./graphTemplate/${template.name}.js`).then(res => {
                graph.currentGraphFileName = template.showName;
                refreshGraphName(graph);
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
                    document.querySelector(".dyaTemplateArea").style.display = "none";
                    let codeEval = `
                    ${res.data};
                    try{
                    bind();
                    }catch{}
                    window.main=main;
                    window.graphData=main();
                    `;
                    eval(codeEval);

                    graph.clear();
                    let data = JSON.parse(window.graphData.toJson());
                    graph.load(data, true);
                    currentGraph = graph;
                } catch (e) {
                    showCodeError(e.message);
                }
                hideCenterWindow(document.querySelector("#windowTemplateDya"));
            });
        }
        let domAddedImg = document.createElement("img");
        domAddedImg.src = `./graphTemplate/${template.name}.png`;
        let domAddedP = document.createElement("p");
        domAddedP.innerHTML = template.showName;
        domAddedLi.appendChild(domAddedImg);
        domAddedLi.appendChild(domAddedP);
        domAddedContainer.appendChild(domAddedLi);
    }
    document.querySelector("#windowTemplateDya .content").innerHTML = "";
    document.querySelector("#windowTemplateDya .content").appendChild(domAddedContainer);
    showCenterWindow(document.querySelector("#windowTemplateDya"));
}

/**
 * 保存自定义节点
 */
export function showSaveNodeTemplate(nodeString, nodeDom, nodeObj, graph) {
    showCenterWindow(document.querySelector("#windowSaveNodeTemplate"));

    document.querySelector("#nodeNameInput").value = "";
    document.querySelector("#nodeImgInput").value = "";

    document.querySelector("#nodeNameInput").oninput = function () {

    }
    document.querySelector("#nodeNameAccept").onclick = async function () {
        // 图片上传服务器
        let nodeUploadData = await uploadStaticFile(NODE_UPLOAD_PATH, "node", document.querySelector("#nodeImgInput").files[0]);
        console.log(nodeUploadData)
        if (nodeUploadData.state == 1) {
            let nodeStorage = getLocalStorage("gd_nodeTemplate");
            let nodeImgUrl = NODE_STORE_PATH + nodeUploadData.msg.filename;
            // 更新LocalStorage
            if (!nodeStorage) {
                nodeStorage = "[]";
            }
            nodeStorage = JSON.parse(nodeStorage);
            nodeStorage.push(
                {
                    showName: document.querySelector("#nodeNameInput").value,
                    nodeString: JSON.stringify([nodeString]),
                    imgUrl: nodeImgUrl
                }
            )
            setLocalStorage("gd_nodeTemplate", JSON.stringify(nodeStorage));
            refreshNodeTemplate(graph);
            hideCenterWindow(document.querySelector("#windowSaveNodeTemplate"));
        } else {
            console.log("文件上传失败");
        }
    }
}

function showCenterWindow(selector) {
    document.querySelectorAll(".hint").forEach(dom => {
        dom.classList = "hint hide";
    })
    selector.style.opacity = 1;
    selector.style.pointerEvents = "all";
    selector.style.transition = "0.3s ease-in-out";
    // 绑定关闭事件
    selector.querySelector(".centerWindowCloseBtn").onclick = function () {
        hideCenterWindow(selector);
    }
    if (selector.querySelector(".close"))
        selector.querySelector(".close").addEventListener("click", function () {
            hideCenterWindow(selector);
        });
}

function hideCenterWindow(selector) {
    selector.style.opacity = 0;
    selector.style.pointerEvents = "none";
}

export function hideDyaTemplateArea() {
    document.querySelector(".dyaTemplateArea").style.display = "none";
    document.querySelector("#dyaTemplateContent").innerHTML = "";
}

/**
 * 收起或者打开指定的节点面板
 */
export function refreshLeftWindow(domId) {
    if (document.querySelector(`#${domId} .title .slideUpBtn`).classList == "slideUpBtn fa fa-angle-double-left") {
        document.querySelector(`#${domId} .content`).style.opacity = 0;
        document.querySelector(`#${domId} .content`).style.pointerEvents = "none";
        document.querySelector(`#${domId}`).style.width = "30px";
        document.querySelector(`#${domId}`).style.height = "40px";
        document.querySelector(`#${domId} .title .slideUpBtn`).classList = "slideUpBtn fa fa-angle-double-right";
        document.querySelector(`#${domId} .title .icon`).style.display = "none";
        document.querySelector(`#${domId} .title p`).style.display = "none";
    } else {
        document.querySelector(`#${domId} .content`).style.opacity = 1;
        document.querySelector(`#${domId} .content`).style.pointerEvents = "all";
        document.querySelector(`#${domId}`).style.width = "163px";
        document.querySelector(`#${domId}`).style.height = "max-content";
        document.querySelector(`#${domId} .title .slideUpBtn`).classList = "slideUpBtn fa fa-angle-double-left";
        document.querySelector(`#${domId} .title .icon`).style.display = "inline";
        document.querySelector(`#${domId} .title p`).style.display = "inline";
    }
}

/**
 * 窗口大小自适应
 */
export function recalSize(graph) {
    graph.renderProperties.svg
        .attr("width", document.querySelector(".displayArea").offsetWidth)
        .attr("height", document.querySelector(".displayArea").offsetHeight)
}

/**
 * 拖入图片自动创建图片节点
 */
export function bindFileDropEvent(graph) {
    let domDropContainer = document.querySelector("svg");
    async function dragEvent(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.type == "drop") {
            // 放下文件
            // 遍历拖入的文件
            for (let file of e.dataTransfer.files) {
                // 图片上传
                // 判断文件类型
                let imgAcceptList = ["png", "jpg", "PNG", "JPG", "webp", "WEBP", "gif", "GIF", "jpeg", "JPEG"];
                if (imgAcceptList.includes(file.name.split(".")[file.name.split(".").length - 1])) {
                    let imgUploadData = await uploadStaticFile(IMG_UPLOAD_PATH, "pic", file);
                    if (imgUploadData.state == 1) {
                        let returnImgName = imgUploadData.msg.filename;
                        graph.addNodeFromString(imgInNode(returnImgName), false);
                    } else {
                        console.log("文件上传失败")
                    }
                }
            }
        } else if (e.type == "dragleave") {
            // 离开
        } else {
            // 进入
        }
    }
    domDropContainer.ondragenter = dragEvent;
    domDropContainer.ondragover = dragEvent;
    domDropContainer.ondrop = dragEvent;
    domDropContainer.ondragleave = dragEvent;
}

/**
 * 从剪贴板读取图片并粘贴
 */
export async function pasteImgFromClipboard(pasteContents, graph) {
    for (let item of pasteContents) {
        if (item.types.includes("image/png")) {
            let blob = await item.getType("image/png");
            let imgUploadData = await uploadStaticFile(IMG_UPLOAD_PATH, "pic", blob);
            if (imgUploadData.state == 1) {
                let returnImgName = imgUploadData.msg.filename;
                graph.addNodeFromString(imgInNode(returnImgName), false);
            } else {
                console.log("文件上传失败")
            }
        }
    }
}

/**
 * 弹出LOADGIN页面
 */
export function showLoadingPage() {
    document.querySelector("#loadingTip").innerHTML = loadingTipList[Math.floor(Math.random() * loadingTipList.length)].text;
    document.querySelector("#loadGraph").style.opacity = 1;
}

/**
 * 隐藏LOADING页面
 */
export function hideLoadingPage() {
    document.querySelector("#loadGraph").style.opacity = 0;
}

/**
 * 提取所有节点关键词
 */
export function extractAllNode(graph) {
    graph.extractAllNode();
}

/**
 * 刷新图谱
 */
export function refreshGraph(graph) {
    graph.reload();
}

/**
 * 更新自定义节点列表
 */
export function refreshNodeTemplate(graph) {
    let nodeStorage = getLocalStorage("gd_nodeTemplate");
    if (!nodeStorage) {
        nodeStorage = "[]";
    }
    nodeStorage = JSON.parse(nodeStorage);
    let domContainer = document.querySelector("#selfNodeArea ul");
    domContainer.innerHTML = "";
    for (let i = 0; i < nodeStorage.length; i++) {
        let currentNodeTp = nodeStorage[i];
        let nodeContainer = document.createElement("li");
        let nodeImg = document.createElement("img");
        nodeImg.src = `${currentNodeTp.imgUrl}`;
        let nodeDeleteBtn = document.createElement("div");
        nodeDeleteBtn.innerHTML = "x";
        nodeDeleteBtn.classList = "deleteBtn";
        nodeContainer.title = currentNodeTp.showName;
        nodeContainer.appendChild(nodeDeleteBtn);
        nodeContainer.appendChild(nodeImg);
        nodeImg.onclick = function () {
            addTpNode(currentNodeTp, graph);
        }
        nodeDeleteBtn.onclick = function () {
            nodeStorage.splice(i, 1);
            setLocalStorage("gd_nodeTemplate", JSON.stringify(nodeStorage));
            refreshNodeTemplate(graph);
        }
        domContainer.appendChild(nodeContainer);
    }
    // 保存到本地
    document.querySelector(".exportBtn").onclick = function () {
        let blob = new Blob([JSON.stringify(nodeStorage)]);
        saveAs(blob, +new Date() + ".vgn");
    }
    // 从本地加载
    document.querySelector(".importBtn").onclick = function () {
        let elementInput = document.createElement("input");
        elementInput.type = "file";
        elementInput.accept = ".vgn";
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
                    data = JSON.parse(readRes.target.result);
                    setLocalStorage("gd_nodeTemplate", JSON.stringify(data));
                    refreshNodeTemplate(graph);
                });
                reader.addEventListener("error", () => {
                    alert("打开文件失败");
                });
            } catch {
                console.error("打开文件出错");
            }
        });
    }
    // 清空自定义节点
    document.querySelector(".clearBtn").onclick = function () {
        nodeStorage = "[]";
        setLocalStorage("gd_nodeTemplate", nodeStorage);
        refreshNodeTemplate(graph);
    }
}

/**
 * json ld导出
 */
export function exportJsonLd(graph) {
    let jsonObj = graph.toJsonObj();
    jsonObj["@context"] = "http://121.40.159.180:7891/media/files/GdContext_060214.json";
    let blob = new Blob([JSON.stringify(jsonObj)]);
    saveAs(blob, +new Date() + ".json");
}

/**
 * 执行GDoc命令
 */
export function activateCmd(graph) {
    let cmdString = document.querySelector("#cmdInput").value;
    doCmd(graph, cmdString);
}

/**
 * 开启多人协作
 */
export async function refreshSocket(graph, open) {
    // 获取数据填入窗体
    if (open) {
        let response = await loadGraphConfig(graph.currentGraphFileName);
        if (response.state == 1) {
            let graphName = response.msg.name;
            let uid = response.msg.author.id;
            let gid = response.msg.id;
            showMessage("已开启协作\n登录同一账号即可共同创作!", () => {
                // 发起ws
                graph.startSocket(gid + "_" + uid);
            });
        } else {
            showMessage("保存到云才能开启协作", () => {
                document.querySelector("#check_openSocket").removeAttribute("checked");
            });
        }
    } else {
        // 关闭ws
        graph.stopSocket();
        showMessage("已关闭多人协作");
    }
}