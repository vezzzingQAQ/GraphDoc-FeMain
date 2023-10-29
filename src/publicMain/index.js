import { listPublicGraph, listUser } from "../public/js/serverCom";
import { AVATAR_STORE_PATH, DOWNLOAD_LINK, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, LAW_LINK, USER_PAGE } from "../public/js/urls";
import "./css/index.less";
import mainBg from "./../asset/img/icon/mainBg.jpg";
import { setWindowIcon } from "../public/js/iconSetter";

window.addEventListener("load", async () => {
    setWindowIcon();
    let graphListResponse = await listPublicGraph();
    let userListResponse = await listUser();
    if (graphListResponse.state == 1 && userListResponse.state == 1) {

        let graphList = graphListResponse.msg;
        let userList = userListResponse.msg;

        let index = 0;
        graphList.forEach(graph => {
            index++;
            let domGraphBlock = document.createElement("li");
            let domGraphBlockImg = document.createElement("div");
            domGraphBlockImg.style.backgroundImage = `url(${GRAPH_PNG_STORE_PATH}${graph.img})`;
            let domGraphBlockText = document.createElement("p");
            let domGraphAuthorImg = document.createElement("img");
            domGraphAuthorImg.src = AVATAR_STORE_PATH + graph.author.img;
            domGraphAuthorImg.addEventListener("click", function (e) {
                window.open(`${USER_PAGE}?uid=${graph.author.id}`);
            });
            let domGraphName = document.createElement("span");
            domGraphName.innerHTML = graph.name.length < 6 ? graph.name : graph.name.slice(0, 5) + "...";
            domGraphBlockText.appendChild(domGraphAuthorImg);
            domGraphBlockText.appendChild(domGraphName);
            domGraphBlock.appendChild(domGraphBlockImg);
            domGraphBlock.appendChild(domGraphBlockText);
            domGraphBlockImg.addEventListener("click", async function (e) {
                window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}&uid=${graph.author.id}`);
            });
            document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
        });
    }

    // 计算窗口滚动百分比&背景变色
    let totalH = document.body.scrollHeight || document.documentElement.scrollHeight;
    let clientH = window.innerHeight || document.documentElement.clientHeight;
    window.addEventListener("scroll", function (e) {
        let validH = totalH - clientH;
        let scrollH = document.body.scrollTop || document.documentElement.scrollTop;
        let result = scrollH / validH;
        document.querySelector(".mainWindow").style.backgroundColor = `rgb(
            ${255 - result * 255},
            ${255 - result * 255},
            ${255 - result * 255}
        )`;
        // 改变图片位置
        document.querySelector("#mainBg").style.marginTop = `${result * document.querySelector("body").offsetHeight / 10}px`;
        document.querySelector("#mainBg").style.opacity = (1 - result * 3);
        this.document.querySelector(".menuBlock").style.marginBottom = `${30 + result * document.querySelector("body").offsetHeight / 10}px`;
        document.querySelector(".menuBlock").style.opacity = (1 - result * 3);
        document.querySelectorAll(".sub").forEach(dom => {
            dom.style.opacity = (1 - result * 3);
        });
    });

    // 点击按钮进入编辑器
    document.querySelector("#editor").addEventListener("click", function () {
        window.location = EDITOR_PGAE;
    });

    // 绑定图片
    document.querySelector("#footerImg").src = mainBg;

    // 页脚模式切换
    if (process.env.RUN_ENV == "app") {
        document.querySelector(".webFooter").style.display = "none";
        document.querySelector(".appFooter").style.display = "flex";
    } else {
        document.querySelector(".webFooter").style.display = "flex";
        document.querySelector(".appFooter").style.display = "none";
    }

    // 下载APP
    document.querySelector("#download").addEventListener("click", function () {
        const downloadElement = document.createElement("a");
        downloadElement.style.display = "none";
        downloadElement.href = DOWNLOAD_LINK;
        downloadElement.target = "_blank";
        downloadElement.rel = "noopener noreferrer";
        downloadElement.download = "GraphDoc";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
    });

    // 下载使用条款
    document.querySelector("#laws").addEventListener("click", function () {
        const downloadElement = document.createElement("a");
        downloadElement.style.display = "none";
        downloadElement.href = LAW_LINK;
        downloadElement.target = "_blank";
        downloadElement.rel = "noopener noreferrer";
        downloadElement.download = "GraphDoc";
        document.body.appendChild(downloadElement);
        downloadElement.click();
        document.body.removeChild(downloadElement);
    });
});