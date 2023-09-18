import { listPublicGraph } from "../public/js/serverCom";
import { AVATAR_STORE_PATH, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, USER_AVATAR_ROOT } from "../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
    let graphListResponse = await listPublicGraph();
    if (graphListResponse.state == 1) {
        let graphList = graphListResponse.msg;
        graphList.forEach(graph => {
            let domGraphBlock = document.createElement("li");
            let domGraphBlockImg = document.createElement("div");
            domGraphBlockImg.style.backgroundImage = `url(${GRAPH_PNG_STORE_PATH}${graph.img})`;
            let domGraphBlockText = document.createElement("p");
            let domGraphAuthorImg = document.createElement("img");
            domGraphAuthorImg.classList = "graphAuthorImg";
            domGraphAuthorImg.src = AVATAR_STORE_PATH + graph.author.img;
            let domGraphName = document.createElement("span");
            domGraphName.innerHTML = graph.name;
            domGraphBlockText.appendChild(domGraphAuthorImg);
            domGraphBlockText.appendChild(domGraphName);
            domGraphBlock.appendChild(domGraphBlockImg);
            domGraphBlock.appendChild(domGraphBlockText);
            domGraphBlock.addEventListener("click", () => {
                window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}&uid=${graph.author.id}`);
            });
            document.querySelector(".graphListBlock ul").appendChild(domGraphBlock);
        })
    }
});