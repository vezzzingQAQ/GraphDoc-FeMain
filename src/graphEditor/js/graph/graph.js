/**
 * 类文档：
 * 
 * Graph
 * |_nodeList         - 图谱的节点列表
 * |                  · 储存的是Node类指针
 * |_wdgeList         - 图谱的关系列表
 * |                  · 储存edge类指针
 * |_selectedNodeList - 被选中的节点的列表
 * |_renderProperties - 渲染的参数集
 * |                  · 储存渲染的svg、viewAarea等参数，方便在不同的方法之间调用
 * |_addNode(node)    - 向图谱中添加节点
 * |_render()         - 渲染图谱
 * |_modifyNode(node) - 修改特定node的参数，传入node类，自动寻找其DOM元素
 * |_select(node)     - 选择一个指定的节点
 * |_toJsonObj()      - 将图谱转换为JsonObject
 * |_clearRender()    - 清除所有的svg元素和力模拟数据 TODO
 * 
 * 从JSON生成图谱：
 * · 调用函数LoadGraphFromJson(jsonObj)来返回一个图谱类
 */

import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import { LoadEdgeFromJson, LoadNodeFromJson } from "./element";

export class Graph {
    /**
     * 图谱类
     */
    constructor(storeObj = {
        nodeList: [],
        edgeList: []
    }) {
        this.nodeList = storeObj.nodeList;
        this.edgeList = storeObj.edgeList;
        //test
        this.selectedElementList = [];
        this.selectedElement = null;
        // 渲染
        this.renderProperties = {
            svg: null,
            viewArea: null,
            simulation: null
        }
    }

    /**
     * 向图谱中添加节点
     * @param {Node} node 要添加的节点
     */
    addNode(node) {
        if (!this.nodeList.includes(node)) {
            if (!node.uuid) {
                let id = `zznode${uuidv4().split("-").join("")}`;
                node.setUuid(id);
            }
            node.owner = this;
            this.nodeList.push(node);
        } else {
            console.error(`节点已存在:${node}`);
        }
    }

    /**
     * 向图谱中添加关系
     * @param {edge} edge 要添加的关系
     */
    addEdge(edge) {
        if (!this.edgeList.includes(edge)) {
            if (!edge.uuid) {
                let id = `zzedge${uuidv4().split("-").join("")}`;
                edge.setUuid(id);
            }
            edge.owner = this;
            this.edgeList.push(edge);
        } else {
            console.error(`关系已存在:${node}`);
        }
    }

    /**
     * 渲染图谱
     */
    render() {

        // 重定向this，用于函数内访问
        let _ = this;

        let renderDom = document.querySelector(".displayArea");

        // 创建所需要的力
        const linkForce = d3.forceLink()
            .links(this.edgeList)
            .distance(500);

        const centerForce = d3.forceCenter()
            .x(renderDom.offsetWidth / 2)
            .y(renderDom.offsetHeight / 2)
            .strength(0.3);

        // const chargeForce = d3.forceManyBody()
        //     .strength(d => d.getComponent("physics_node").getValue("manyBodyForceStrength"))
        //     .distanceMax(d => d.getComponent("physics_node").getValue("manyBodyForceRangeMax"))
        //     .distanceMax(d => d.getComponent("physics_node").getValue("manyBodyForceRangeMin"));

        const chargeForce = d3.forceManyBody()
            .strength(-80)
            .distanceMax(200)
            .distanceMin(10);

        const collideForce = d3.forceCollide()
            .radius(d => d.getComponent("physics_node").getValue("collisionRadius"));

        // 创建物理模拟
        this.renderProperties.simulation = d3.forceSimulation(this.nodeList)
            .force("link", linkForce)
            .force("center", centerForce)
            .force("charge", chargeForce)
            .force("collide", collideForce)
            .alphaDecay(0.08);

        // 创建画布
        this.renderProperties.svg = d3.select(".displayArea svg")
            .attr("width", renderDom.offsetWidth)
            .attr("height", renderDom.offsetHeight)

        // 创建绘画区域
        this.renderProperties.viewArea = this.renderProperties.svg.append("g")
            .attr("class", "viewArea");

        // 绘制关系
        const edges = this.renderProperties.viewArea.selectAll(".forceLine")
            .data(this.edgeList)
            .enter()
            .append("line")
            .attr("class", "forceLine")
            .attr("id", d => d.uuid)
            .style("stroke", d => d.getComponent("exterior_edge").getValue("strokeColor"))
            .style("stroke-width", d => d.getComponent("exterior_edge").getValue("strokeWidth"))
            .style("cursor", "pointer")
            .on("click", function (d, i) {
                let edgeDom = d3.select(this);
                let edgeObj = _.findEdgeObj(edgeDom);
                _.selectElement(edgeObj);
            });

        // 绘制node
        const nodes = this.renderProperties.viewArea.selectAll(".forceNode")
            .data(this.nodeList)
            .enter()
            .append("g")
            .attr("class", "forceNode")
            .attr("id", d => d.uuid)
            // 点击选中
            .on("click", function () {
                let nodeDom = d3.select(this);
                let nodeObj = _.findNodeObj(nodeDom);
                _.selectElement(nodeObj);
            })
            // 双击进入节点
            .on("dbclick", function () {

            })
            .call(drag(this.renderProperties.simulation))
            .attr(`transform`, d => {
                let x = d.autoGetValue("physics_node", "position", 0, (value) => { return value.x });
                let y = d.autoGetValue("physics_node", "position", 0, (value) => { return value.y });
                return `translate(${x},${y})`;
            });

        // 根据外观组件绘制节点的形状
        const nodeDraw = nodes.append("circle")
            .attr("class", "nodeCircle")
            // 绑定自定义的属性
            .attr("r", d => d.autoGetValue("exterior_node", "size", 10, (value) => { return value.x }))
            .style("fill", d => d.autoGetValue("exterior_node", "bgColor", "#000000"))
            .style("stroke", d => d.autoGetValue("exterior_node", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_node", "strokeWidth", 1))
            .style("cursor", "pointer");

        // 计算物理模拟
        this.renderProperties.simulation.on("tick", () => {
            edges
                .attr("x1", d => d.source.autoGetValue("physics_node", "position", 0, (value) => value.x))
                .attr("y1", d => d.source.autoGetValue("physics_node", "position", 0, (value) => value.y))
                .attr("x2", d => d.target.autoGetValue("physics_node", "position", 0, (value) => value.x))
                .attr("y2", d => d.target.autoGetValue("physics_node", "position", 0, (value) => value.y));

            nodes.attr("transform", function (d) {
                let nodeDom = d3.select(this);
                let nodeObj = _.findNodeObj(nodeDom);
                nodeObj.autoSetValue("physics_node", "position", { x: d.x, y: d.y });
                return `translate(${d.x},${d.y})`
            });
        });

        // 缩放平移
        this.renderProperties.svg.call(d3.zoom()
            .extent([[0, 0], [window.innerWidth, window.innerHeight]])
            .scaleExtent([0.1, 20])

            .on("zoom", ({ transform }) => {
                this.renderProperties.viewArea.attr("transform", transform);
            }))
            // 取消双击放大事件
            .on("dblclick.zoom", null);

        // 拖动
        function drag(simulation) {

            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }

            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }

            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }

    /**
     * 根据D3的node节点返回对应的node类实例
     * @param {obj} node d3的node节点 
     * @returns gc的node节点
     */
    findNodeObj(node) {
        console.log(node.data)
        for (let nodeObj of this.nodeList) {
            let nodeUuid = nodeObj.uuid;
            if (node.attr("id") == nodeUuid) {
                return nodeObj;
            }
        }
        console.error(`未找到对应的节点:${node}`);
    }

    /**
     * 根据D3的edge节点返回对应的edge类实例
     * @param {obj} edge d3的edge节点
     * @returns gc的edge节点
     */
    findEdgeObj(edge) {
        for (let edgeObj of this.edgeList) {
            let edgeUuid = edgeObj.uuid;
            if (edge.attr("id") == edgeUuid) {
                return edgeObj;
            }
        }
        console.log(edge)
        console.error(`未找到对应的关系:${edge}`);
    }

    /**
     * 修改单个节点
     */
    modifyNode(nodeObj) {
        const findedNode = this.renderProperties.viewArea.select(`#${nodeObj.uuid}`)
        const findedNodeCircle = findedNode.select("circle")
            .attr("r", nodeObj.getComponent("exterior_node").getValue("size").x)
            .style("fill", nodeObj.getComponent("exterior_node").getValue("bgColor"))
            .style("stroke", nodeObj.getComponent("exterior_node").getValue("strokeColor"))
            .style("stroke-width", nodeObj.getComponent("exterior_node").getValue("strokeWidth"))
    }

    /**
     * 修改单个关系
     */
    modifyEdge(edgeObj) {
        const findedEdge = this.renderProperties.viewArea.select(`#${edgeObj.uuid}`);
        findedEdge
            .style("stroke", d => d.getComponent("exterior_edge").getValue("strokeColor"))
            .style("stroke-width", d => d.getComponent("exterior_edge").getValue("strokeWidth"))
    }

    selectElement(elementObj) {
        //this.selectedNode.push(node)
        this.selectedElement = elementObj;
        console.log(elementObj)
        document.querySelector(".panArea").innerHTML = "";
        document.querySelector(".panArea").appendChild(elementObj.initHtml());
    }

    toJsonObj() {
        let jsonObj = {
            nodeList: [],
            edgeList: []
        };
        for (let node of this.nodeList) {
            jsonObj.nodeList.push(node.toJsonObj());
        }
        for (let edge of this.edgeList) {
            jsonObj.edgeList.push(edge.toJsonObj());
        }
        return jsonObj;
    }
}


export function LoadGraphFromJson(jsonObj) {
    let graph = new Graph();
    let nodeJsonList = jsonObj.nodeList;
    let edgeJsonList = jsonObj.edgeList;
    for (let nodeJson of nodeJsonList) {
        let node = LoadNodeFromJson(nodeJson);
        graph.addNode(node);
    }
    for (let edgeJson of edgeJsonList) {
        let edge = LoadEdgeFromJson(edgeJson, graph.nodeList);
        graph.addEdge(edge);
    }
    return graph;
}