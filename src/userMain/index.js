import { getOUtherData } from "../public/js/serverCom";
import { getQueryVariable } from "../public/js/tools";
import { EDITOR_PGAE, GRAPH_PNG_STORE_PATH, USER_AVATAR_ROOT } from "./../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
    let username = getQueryVariable("username");
    let userData = await getOUtherData(username);
    document.querySelector("#userAvatar").src = `${USER_AVATAR_ROOT}${userData.data.msg.avatar}`;
    document.querySelector("#username").innerHTML = userData.data.msg.username;
    let graphList = userData.data.msg.graphs;
    graphList.forEach(graph => {
        let domGraphBlock = document.createElement("li");
        let domGraphBlockImg = document.createElement("div");
        domGraphBlockImg.style.backgroundImage = `url(${GRAPH_PNG_STORE_PATH}${graph.img})`;
        let domGraphBlockText = document.createElement("p");
        domGraphBlockText.innerHTML = graph.name;
        domGraphBlock.appendChild(domGraphBlockImg);
        domGraphBlock.appendChild(domGraphBlockText);
        domGraphBlock.addEventListener("click", function () {
            console.log(encodeURI(graph.name))
            window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}`);
        });
        document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
    })
});