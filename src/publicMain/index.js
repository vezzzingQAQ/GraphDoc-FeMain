import { listPublicGraph, listUser } from "../public/js/serverCom";
import { AVATAR_STORE_PATH, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, USER_PAGE } from "../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
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
                window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}&uid=${graph.author.id}&mode=1`);
            });
            document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
        });
    }

    // 计算窗口滚动百分比
    let totalH = document.body.scrollHeight || document.documentElement.scrollHeight;
    let clientH = window.innerHeight || document.documentElement.clientHeight;
    window.addEventListener("scroll", function (e) {
        let validH = totalH - clientH;
        let scrollH = document.body.scrollTop || document.documentElement.scrollTop;
        let result = scrollH / validH;
        console.log(result);
        document.querySelector(".mainWindow").style.backgroundColor = `rgb(
            ${255 - result * 255},
            ${255 - result * 255},
            ${255 - result * 255}
        )`
    });

    // 点击按钮进入编辑器
    document.querySelector("#editor").addEventListener("click", function () {
        window.location = EDITOR_PGAE;
    })
});