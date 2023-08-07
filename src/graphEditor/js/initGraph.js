/**
 * 初始化graphEditor的SVG绘图
 * by vezzzing 2023.8.3
 * z z z studio
 */

import { CreateBasicEdge, CreateBasicNode, CreateLinkNode } from "./graph/element";
import { LoadGraphFromJson, Graph } from "./graph/graph";

/**
 * 根据储存的数据对象绘制图表
 * @param {object} graphObj 文档储存JSON对象
 * @returns 返回创建的Graph对象
 */
export function initGraph(graphObj) {
    let graph = new Graph();
    let centerNode = CreateBasicNode();
    graph.addNode(centerNode);
    let pNode = null;
    for (let i = 0; i < 413; i++) {
        let addedNodeLink = CreateLinkNode();
        graph.addNode(addedNodeLink);
        let addedEdge = CreateBasicEdge(centerNode, addedNodeLink);
        graph.addEdge(addedEdge);
        if (pNode) {
            let addedEdge2 = CreateBasicEdge(pNode, addedNodeLink);
            graph.addEdge(addedEdge2);
        }
        pNode = addedNodeLink;
    }

    //     let graph=LoadGraphFromJson(JSON.parse(`
    //     `));
    graph.render();
    return graph;
}