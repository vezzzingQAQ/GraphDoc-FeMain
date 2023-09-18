import ForceGraph3D from "3d-force-graph";
import { CSS2DRenderer, CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";

import { listPublicGraph, listUser } from "../public/js/serverCom";
import { AVATAR_STORE_PATH, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, USER_AVATAR_ROOT, VIEW_PAGE } from "../public/js/urls";
import "./css/index.less";


window.addEventListener("load", async () => {
    let graphListResponse = await listPublicGraph();
    let userListResponse = await listUser();
    if (graphListResponse.state == 1 && userListResponse.state == 1) {

        let graphList = graphListResponse.msg;
        let userList = userListResponse.msg;

        // 处理数据
        let nodeList = [];
        let edgeList = [];
        nodeList.push({
            "type": "center",
            "name": "创新·智能",
            "id": nodeList.length
        })
        userList.forEach(user => {
            nodeList.push({
                "type": "user",
                "name": user.name,
                "img": AVATAR_STORE_PATH + user.img,
                "id": nodeList.length
            });
            edgeList.push({
                source: 0,
                target: nodeList.length - 1,
                len: 100
            });
        })
        for (let i = 0; i < graphList.length; i++) {
            let graph = graphList[i];
            nodeList.push({
                "type": "graph",
                "name": graph.name,
                "img": GRAPH_PNG_STORE_PATH + graph.img,
                "toUrl": `${VIEW_PAGE}?graphName=${encodeURI(graph.name)}&uid=${graph.author.id}`,
                "id": nodeList.length
            });
            // 寻找作者索引
            let userIndex;
            for (let i = 0; i < nodeList.length; i++) {
                if (nodeList[i].type == "user" && nodeList[i].name == graph.author.name) {
                    userIndex = i;
                    break;
                }
            }
            edgeList.push({
                source: userIndex,
                target: nodeList.length - 1,
                len: 100
            });
        }

        console.log(nodeList, edgeList);
        // 生成图谱
        const graph3d = ForceGraph3D({
            extraRenderers: [new CSS2DRenderer()]
        });

        graph3d(document.querySelector(".displayArea"))
            .graphData({
                nodes: nodeList,
                links: edgeList
            })
            .showNavInfo(false)
            .nodeThreeObject(node => {
                const domNodeWindow = document.createElement("div");
                domNodeWindow.style.pointerEvents = "auto";
                if (node.type == "center") {
                    domNodeWindow.classList = "ngraphWindow center";
                    domNodeWindow.innerHTML = node.name;
                } else if (node.type == "user") {
                    domNodeWindow.classList = "ngraphWindow user";
                    domNodeWindow.innerHTML = `
                        <img src='${node.img}'>
                    `;
                } else {
                    domNodeWindow.classList = "ngraphWindow graph";
                    domNodeWindow.innerHTML = `
                        <img src='${node.img}'>
                        <p>${node.name}</p>
                    `;
                    domNodeWindow.addEventListener("click", function () {
                        window.location = node.toUrl;
                    })
                }
                return new CSS2DObject(domNodeWindow);
            })
            .nodeThreeObjectExtend(true)
            .nodeAutoColorBy("id")
            .nodeLabel("")
            .nodeOpacity(1)
            .linkWidth(0.2)
            .linkOpacity(0.8)
            .nodeRelSize(0.1)
            .d3Force("link")
            .distance(link => link.len * (Math.random() * 0.8 + 0.6))
    }
});