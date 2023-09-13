/**
 * 用来提供各种事件
 * by vezzzing 2023.8.23
 * z z z studio
 */

import axios from "axios";
import { saveAs } from 'file-saver';
import { EDITOR_PGAE, GRAPH_SVG_UPLOAD_PATH, USER_AVATAR_ROOT, USER_DATA, USER_LOGIN, USER_REGISTER, GRAPH_PNG_STORE_PATH, USER_PAGE, AVATAR_STORE_PATH } from "../../public/js/urls";
import { delCookie, getCookie, getQueryVariable, setCookie } from "../../public/js/tools";
import { deleteGraph, getUserData, listUserGraph, loadGraphFromCloud, saveGraphToCloud } from "../../public/js/serverCom";
import defaultAvatarPng from "./../../asset/img/defaultAvatar.png";
import newGraphJson from "./../../asset/graph/new.json";

const templateList = [
    {
        showName: "关系图",
        name: "centerGraph",
    },
    {
        showName: "图谱",
        name: "graph",
    },
    {
        showName: "钢琴",
        name: "piano",
    },
    {
        showName: "考拉兹猜想",
        name: "cc1",
    },
    {
        showName: "圆周率",
        name: "pie",
    },
    {
        showName: "中国行政区划",
        name: "cdc",
    },
];

const templateDyaList = [
    {
        showName: "碱基对",
        name: "gen1",
    },
    {
        showName: "年份图",
        name: "dyaData",
    }
]

let currentGraph = null;

// 用户配置
export let userConfig = {
    isDark: true,
    isLogin: false,
    currentGraphFileName: "",
    username: null
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
export function exportPng(graph) {
    graph.exportPng();
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
                document.querySelector("#loadGraph").style.opacity = 1;
                window.setTimeout(() => {
                    userConfig.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                    refreshGraphName();
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
    userConfig.currentGraphFileName = "未命名图谱";
    refreshGraphName();
    graph.clear();
    graph.load(newGraphJson, true);
    hideDyaTemplateArea();
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
        document.querySelector("#password_conflict").classList = "hint show";
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
            hideCenterWindow(document.querySelector("#windowRegister"));
            showLogin();
        } else if (d.data.state == 0) {
            document.querySelector("#user_name_exist").classList = "hint show";
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
    }).then(async d => {
        if (d.data.state == 1) {
            setCookie('jwt', d.data.jwt, 1000 * 60 * 60 * 1000);
            // 获取用户信息进行显示
            let userData = await getUserData();
            refreshUserData(userData);
            hideCenterWindow(document.querySelector("#windowLogin"));
        } else if (d.data.state == 2) {
            document.querySelector("#login_password").value = "";
            document.querySelector("#hint_password_incorrect").classList = "hint show";
        } else if (d.data.state == 3) {
            document.querySelector("#login_username").value = "";
            document.querySelector("#login_password").value = "";
            document.querySelector("#hint_user_not_exist").classList = "hint show";
        }
    })
}

/**
 * 用户退出
 */
export async function userLogout() {
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

    let formData = new FormData();
    formData.append('svg', svg);
    axios({
        url: GRAPH_SVG_UPLOAD_PATH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(async d => {
        if (name) {
            // 保存到云
            let data = graph.toJson();
            let response = await saveGraphToCloud(data, name, d.data.msg.filename);
            if (response.state == 11 || response.state == 10) {
                userConfig.currentGraphFileName = name;
                refreshGraphName();
                hideCenterWindow(document.querySelector("#windowSaveToCloud"))
            }
        }
    });
}

/**
 * 根据是否登录更新窗体
 */
export function refreshMenu() {
    if (userConfig.isLogin) {
        document.querySelector("#btnLogin").classList = "hide";
        document.querySelector("#btnRegister").classList = "hide";
        document.querySelector("#btnLogout").classList = "show";
        document.querySelector("#btnUserPage").classList = "show";
        document.querySelector("#btnToCloudSavsAs").classList = "show";
        document.querySelector("#btnLoadFromCloud").classList = "show";
    } else {
        document.querySelector("#btnLogin").classList = "show";
        document.querySelector("#btnRegister").classList = "show";
        document.querySelector("#btnLogout").classList = "hide";
        document.querySelector("#btnUserPage").classList = "hide";
        document.querySelector("#btnToCloudSavsAs").classList = "hide";
        document.querySelector("#btnLoadFromCloud").classList = "hide";
    }
}

/**
 * 更新导图名称
 */
export function refreshGraphName() {
    if (userConfig.currentGraphFileName) {
        document.querySelector("#graphName").innerHTML = userConfig.currentGraphFileName;
        window.history.replaceState("", "", `${EDITOR_PGAE}`);
    }
}

/**
 * 更新用户信息
 */
export function refreshUserData(d) {
    if (d.data.state == 1) {
        document.querySelector("#showUsername").innerHTML = d.data.msg.data.username;
        document.querySelector("#showUserAvatar").src = `${AVATAR_STORE_PATH}${d.data.msg.data.avatar}`;
        userConfig.isLogin = true;
        userConfig.username = d.data.msg.data.username;
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
    window.open(`${USER_PAGE}?username=${encodeURI(userConfig.username)}`);
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
    elementInput.accept = "file/js";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            document.querySelector("#loadGraph").style.opacity = 1;
            let reader;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                userConfig.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                refreshGraphName();
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
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
                    document.querySelector("#loadGraph").style.opacity = 0;
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
        eval("window.graphData=window.main();");
        currentGraph.clear();
        let data = JSON.parse(window.graphData.toJson());
        currentGraph.load(data);
    } catch (e) {
        showCodeError(e.message);
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
export function showCodeError(message) {
    showCenterWindow(document.querySelector("#windowCodeError"));
    document.querySelector("#codeErrorShow").innerHTML = message;
    document.querySelector("#closeCodeError").onclick = () => {
        hideCenterWindow(document.querySelector("#windowCodeError"));
    }
}

/**
 * 保存到云
 */
export async function showSaveToCloud() {
    document.querySelector("#saveToCloud").innerHTML = "保存";
    document.querySelector("#windowSaveToCloud ul").innerHTML = "";
    let graphList = await listUserGraph();
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = async () => {
            let response = await deleteGraph(currentGraph.name);
            if (response.state == 1) {
                domGraphTagClose.remove();
                domGraphTagDate.remove();
                domGraphTagName.remove();
                domGraphTag.remove();
            }
        };
        domGraphTag.appendChild(domGraphTagImg);
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
    let graphList = await listUserGraph();
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = async () => {
            let response = await deleteGraph(currentGraph.name);
            if (response.state == 1) {
                domGraphTagClose.remove();
                domGraphTagDate.remove();
                domGraphTagName.remove();
                domGraphTag.remove();
            }
        };
        domGraphTag.appendChild(domGraphTagImg);
        domGraphTag.appendChild(domGraphTagName);
        domGraphTag.appendChild(domGraphTagDate);
        domGraphTag.appendChild(domGraphTagClose);

        domGraphTagName.onclick = async () => {
            document.querySelector("#loadGraph").style.opacity = 1;
            let response = await loadGraphFromCloud(currentGraph.name);
            if (response.state == 1) {
                userConfig.currentGraphFileName = currentGraph.name;
                refreshGraphName();
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
            document.querySelector("#loadGraph").style.opacity = 1;
            userConfig.currentGraphFileName = template.showName;
            refreshGraphName();
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
            document.querySelector("#loadGraph").style.opacity = 1;
            userConfig.currentGraphFileName = template.showName;
            refreshGraphName();
            // 请求本地文件
            axios.get(`./graphTemplate/${template.name}.js`).then(res => {
                userConfig.currentGraphFileName = template.showName;
                refreshGraphName();
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
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