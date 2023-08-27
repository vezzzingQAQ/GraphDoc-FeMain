import { getOUtherData } from "../public/js/serverCom";
import { getQueryVariable } from "../public/js/tools";
import { EDITOR_PGAE, USER_AVATAR_ROOT } from "./../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
    let username = getQueryVariable("username");
    let userData = await getOUtherData(username);
    document.querySelector("#userAvatar").src = `${USER_AVATAR_ROOT}${userData.data.msg.avatar}`;
    document.querySelector("#username").innerHTML = userData.data.msg.username;
    let graphList = userData.data.msg.graphs;
    graphList.forEach(graph => {
        let domGraphBlock = document.createElement("li");
        domGraphBlock.innerHTML = graph.name;
        domGraphBlock.addEventListener("click", function () {
            window.open(`${EDITOR_PGAE}?graphName=${graph.name}`);
        });
        document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
    })
});