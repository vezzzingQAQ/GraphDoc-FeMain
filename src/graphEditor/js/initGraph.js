/**
 * 初始化graphEditor的SVG绘图
 * by vezzzing 2023.8.3
 * z z z studio
 */

import { loadGraphFromCloud } from "../../public/js/serverCom";
import { getQueryVariable } from "../../public/js/tools";
import { CreateBasicEdge, CreateBasicNode, CreateLinkNode } from "./graph/element";
import { userConfig, refreshGraphName } from "./event";
import { LoadGraphFromJson, Graph } from "./graph/graph";

import defaultGraph from "./../../asset/graph/main.json";

/**
 * 根据储存的数据对象绘制图表
 * @param {object} graphObj 文档储存JSON对象
 * @returns 返回创建的Graph对象
 */
export async function initGraph(graphObj) {
    let graph = new Graph();
    let graphName = getQueryVariable("graphName");
    let uid = getQueryVariable("uid");
    if (graphName) {
        if (!uid) {
            let response = await loadGraphFromCloud(graphName)
            if (response.state == 1) {
                userConfig.currentGraphFileName = graphName;
                refreshGraphName();
                let json = response.msg;
                graph.clear();
                graph.load(JSON.parse(json));
                return graph;
            }
        } else {
            let response = await loadGraphFromCloud(graphName, uid);
            if (response.state == 1) {
                userConfig.currentGraphFileName = graphName;
                refreshGraphName();
                let json = response.msg;
                graph.clear();
                graph.load(JSON.parse(json));
                return graph;
            }
        }
    } else {
        graph.clear();
        graph.load(defaultGraph);
        return graph;
    }
}