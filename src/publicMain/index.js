import { listPublicGraph, listUser } from "../public/js/serverCom";
import { AVATAR_STORE_PATH, CONVERTER_URL, DISPLAY_PAGE, DOWNLOAD_LINK, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, LAW_LINK, USER_PAGE } from "../public/js/urls";
import "./css/index.less";
import mainBg from "./../asset/img/icon/mainBg.jpg";
import { setWindowIcon } from "../public/js/iconSetter";
import { GD_VERSION } from "../public/js/version";

let oGraphList = [];
let graphList = [];

function genGraphList(graphList) {
    document.querySelector(".graphListBlock ul").innerHTML = "";
    graphList.forEach(graph => {
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
        domGraphName.innerHTML = graph.name.length < 6 ? graph.name + `<i class="fa fa-eye"></i><span>${graph.view}</span>` : graph.name.slice(0, 5) + `... <i class="fa fa-eye"></i><span>${graph.view}</span>`;
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

window.addEventListener("load", async () => {
    setWindowIcon();
    let graphListResponse = await listPublicGraph();
    let userListResponse = await listUser();
    if (graphListResponse.state == 1 && userListResponse.state == 1) {

        oGraphList = graphListResponse.msg;
        graphList = oGraphList;

        genGraphList(graphList);
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
        this.document.querySelector(".menuBlock").style.marginBottom = `${30 + result * document.querySelector("body").offsetHeight / 10} px`;
        document.querySelector(".menuBlock").style.opacity = (1 - result * 3);
        document.querySelectorAll(".sub").forEach(dom => {
            dom.style.opacity = (1 - result * 3);
        });
    });

    // 点击按钮进入编辑器
    document.querySelector("#editor").addEventListener("click", function () {
        window.location = EDITOR_PGAE;
    });

    // 点击按钮进入DocVis
    document.querySelector("#docVis").addEventListener("click", function () {
        window.open(DISPLAY_PAGE);
    });

    // 点击进入converter
    document.querySelector("#converter").addEventListener("click", function () {
        window.open(CONVERTER_URL);
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
    // document.querySelector("#download").addEventListener("click", function () {
    //     const downloadElement = document.createElement("a");
    //     downloadElement.style.display = "none";
    //     downloadElement.href = DOWNLOAD_LINK;
    //     downloadElement.target = "_blank";
    //     downloadElement.rel = "noopener noreferrer";
    //     downloadElement.download = "GraphDoc";
    //     document.body.appendChild(downloadElement);
    //     downloadElement.click();
    //     document.body.removeChild(downloadElement);
    // });

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

    // 绑定搜索功能
    document.querySelector("#btnSearchGraph").addEventListener("click", function () {
        let searchString = document.querySelector("#inputSearchString").value;
        graphList = oGraphList.filter(graph => {
            return graph.name.indexOf(searchString) !== -1;
        });
        genGraphList(graphList);
    });
    document.querySelector("#inputSearchString").addEventListener("input", function () {
        if (document.querySelector("#inputSearchString").value == "") {
            genGraphList(oGraphList);
        }
    });

    // 获取版本并显示
    document.querySelector("#gdVersion").innerHTML = `${GD_VERSION} `;
});