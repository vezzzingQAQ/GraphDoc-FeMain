/**
 * 类文档：
 * 
 * Graph
 * |_nodeList               - 图谱的节点列表
 * |                        · 储存的是Node类指针
 * |_wdgeList               - 图谱的关系列表
 * |                        · 储存edge类指针
 * |_selectedNodeList       - 被选中的节点的列表
 * |_renderProperties       - 渲染的参数集
 * |                        · 储存渲染的svg、viewAarea等参数，方便在不同的方法之间调用
 * |_addNode(node)          - 向图谱中添加节点
 * |_render()               - 渲染图谱
 * |_modifyNode(node)       - 修改特定node的参数，传入node类，自动寻找其DOM元素
 * |_selectElement(element) - 选择一个指定的元素
 * |_toJsonObj()            - 将图谱转换为JsonObject
 * |_clearRender()          - 清除所有的svg元素和力模拟数据 TODO
 * 
 * 从JSON生成图谱：
 * · 调用函数LoadGraphFromJson(jsonObj)来返回一个图谱类
 */

import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import { LoadEdgeFromJson, LoadNodeFromJson } from "./element";
import { playMusic } from "../../../public/js/musicPlayer";

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
            forces: {
                linkForce: null,
                centerForce: null,
                chargeForce: null,
                collideForce: null
            },
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
        _.renderProperties.forces.linkForce = d3.forceLink()
            .links(_.edgeList)
            .strength(d => d.autoGetValue("physics_edge", "linkStrength", 1))
            .distance(d => d.autoGetValue("physics_edge", "linkDistance", 400));

        _.renderProperties.forces.centerForce = d3.forceCenter()
            .x(renderDom.offsetWidth / 2)
            .y(renderDom.offsetHeight / 2)
            .strength(0.3);

        _.renderProperties.forces.chargeForce = d3.forceManyBody()
            .strength(d => d.autoGetValue("physics_node", "manyBodyForceStrength", -80, value => -value))
            .distanceMax(d => d.autoGetValue("physics_node", "manyBodyForceRangeMin", 10))
            .distanceMin(d => d.autoGetValue("physics_node", "manyBodyForceRangeMax", 12))

        _.renderProperties.forces.collideForce = d3.forceCollide()
            .radius(d => d.autoGetValue("physics_node", "collisionRadius", 20));

        // 创建物理模拟
        _.renderProperties.simulation = d3.forceSimulation(_.nodeList)
            .force("link", _.renderProperties.forces.linkForce)
            .force("center", _.renderProperties.forces.centerForce)
            .force("charge", _.renderProperties.forces.chargeForce)
            .force("collide", _.renderProperties.forces.collideForce)
            .alphaDecay(1.0);

        // 创建画布
        _.renderProperties.svg = d3.select(".displayArea svg")
            .attr("width", renderDom.offsetWidth)
            .attr("height", renderDom.offsetHeight)

        // 创建绘画区域
        _.renderProperties.viewArea = _.renderProperties.svg.append("g")
            .attr("class", "viewArea");

        // 绘制关系
        const edges = _.renderProperties.viewArea.selectAll(".forceLine")
            .data(_.edgeList)
            .enter()
            .append("line")
            .attr("class", "forceEdge forceElemet")
            .attr("id", d => d.uuid)
            .style("cursor", "pointer")
            .style("outline", "none")
            .on("click", function (d, i) {
                let edgeObj = d3.select(this).data()[0];
                let allElement = d3.selectAll(".forceElemet").style("outline", "none");
                let edge = d3.select(this);
                edge.style("outline", "1px dashed white");
                _.selectElement(edgeObj);
            })
            .on("mouseenter", function () {
                // 缩放
                let edge = d3.select(this);
                let edgeObj = d3.select(this).data()[0];
                if (edgeObj.hasComponent("scaleHover_edge")) {
                    let scale = edgeObj.autoGetValue("scaleHover_edge", "scale", 1.2);
                    edge
                        .transition()
                        .duration(edgeObj.autoGetValue("scaleHover_edge", "scaleTime", 800, value => value * 1000))
                        .ease(d3.easeElasticOut)
                        .style("stroke-width", `${edgeObj.autoGetValue("exterior_edge", "strokeWidth") * scale}px`);
                }
            })
            .on("mouseleave", function () {
                // 缩放
                let edge = d3.select(this);
                let edgeObj = d3.select(this).data()[0];
                if (edgeObj.hasComponent("scaleHover_edge")) {
                    edge
                        .transition()
                        .duration(edgeObj.autoGetValue("scaleHover_edge", "scaleTime", 800, value => value * 1000))
                        .ease(d3.easeElasticOut)
                        .style("stroke-width", d => d.autoGetValue("exterior_edge", "strokeWidth", "1px", value => `${value}px`))
                }
            });

        // 绘制node
        const nodes = _.renderProperties.viewArea.selectAll(".forceNode")
            .data(_.nodeList)
            .enter()
            .append("g")
            .attr("class", "forceNode forceElemet")
            .attr("id", d => d.uuid)
            .style("outline-offset", "3px")
            .style("outline", "none")
            // 点击选中
            .on("click", function () {
                let nodeObj = d3.select(this).data()[0];
                let allElement = d3.selectAll(".forceElemet").style("outline", "none");
                let node = d3.select(this);
                node.style("outline", "1px dashed white");
                _.selectElement(nodeObj);
            })
            // 双击进入节点
            .on("dblclick", function () {
                let nodeObj = d3.select(this).data()[0];
                if (nodeObj.hasComponent("link_node")) {
                    let openOuter = nodeObj.autoGetValue("link_node", "openOuter", false);
                    if (openOuter) {
                        window.open(nodeObj.autoGetValue("link_node", "url", "."));
                    } else {
                        window.location = nodeObj.autoGetValue("link_node", "url", ".");
                    }
                }
            })
            // 悬停事件
            .on("mouseenter", function () {
                let nodeObj = d3.select(this).data()[0];
                // 播放音效
                if (nodeObj.hasComponent("audio_node")) {
                    playMusic(nodeObj.autoGetValue("audio_node", "soundVolume", 1));
                }
                // 缩放
                let node = d3.select(this).select(".nodeGraph");
                if (nodeObj.hasComponent("scaleHover_node")) {
                    let radiusScale = nodeObj.autoGetValue("scaleHover_node", "scale", 1.2);
                    node
                        .transition()
                        .duration(d => d.autoGetValue("scaleHover_node", "scaleTime", 800, value => value * 1000))
                        .ease(d3.easeElasticOut)
                        .style("transform", `scale(${radiusScale})`);
                }
            })
            .on("mouseleave", function () {
                let nodeObj = d3.select(this).data()[0];
                let node = d3.select(this).select(".nodeGraph");
                if (nodeObj.hasComponent("scaleHover_node")) {
                    node
                        .transition()
                        .duration(d => d.autoGetValue("scaleHover_node", "scaleTime", 800, value => value * 1000))
                        .ease(d3.easeElasticOut)
                        .style("transform", `scale(1)`);
                }
            })
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))


        // 开始的时候先全部更新一遍，装入数据
        for (let node of _.nodeList) {
            _.modifyNode(node, true);
        }
        for (let edge of _.edgeList) {
            _.modifyEdge(edge, true);
        }

        // 点击空白处取消选择
        d3.select(".displayArea svg").on("click", function (e) {
            if (e.target == this) {
                _.selectedElement = null;
                _.renderProperties.viewArea.selectAll(".forceLine")
                    .style("outline", "none");
                _.renderProperties.viewArea.selectAll(".forceNode")
                    .style("outline", "none");
                document.querySelector(".panArea .listPan").innerHTML = "";
                document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
            }
        });

        // 选中节点后delete删除
        d3.select("body").on("keydown", function (e) {
            if (e.target == this)
                if (e.keyCode == 46) {
                    if (_.selectedElement) {
                        if (_.selectedElement.type = "node") {
                            _.nodeList.splice(_.nodeList.indexOf(_.selectedElement), 1);
                            let nodeUuid = _.selectedElement.uuid;
                            // 移除节点
                            let removedNode = d3.select(`#${nodeUuid}`).remove();
                            // 移除相关关系
                            let removeEdgeList = _.findNodeEdges(_.selectedElement);
                            console.log(removeEdgeList)
                            for (let i = 0; i < removeEdgeList.length; i++) {
                                let currentRemoveEdge = removeEdgeList[i];
                                _.edgeList.splice(_.edgeList.indexOf(currentRemoveEdge), 1);
                                let edgeUuid = currentRemoveEdge.uuid;
                                d3.select(`#${edgeUuid}`).remove();
                            }
                            // 重启物理模拟
                            _.renderProperties.simulation.restart();
                        }
                    }
                }
        });

        // 计算物理模拟
        _.renderProperties.simulation.on("tick", () => {
            edges
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            nodes.attr("transform", d => `translate(${d.x},${d.y})`);
        });

        // 缩放平移
        _.renderProperties.svg.call(d3.zoom()
            .extent([[0, 0], [window.innerWidth, window.innerHeight]])
            .scaleExtent([0.1, 20])

            .on("zoom", ({ transform }) => {
                _.renderProperties.viewArea.attr("transform", transform);
            }))
            // 取消双击放大事件
            .on("dblclick.zoom", null);

        // 拖动
        function dragstarted(event, d) {
            if (!event.active) _.renderProperties.simulation.alphaTarget(0.02).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }
        function dragended(event, d) {
            if (!event.active) _.renderProperties.simulation.alphaTarget(0.0001);
            d.fx = null;
            d.fy = null;
        }
    }


    /**
     * 修改单个节点
     */
    modifyNode(nodeObj, load = false) {
        const findedNode = this.renderProperties.viewArea.select(`#${nodeObj.uuid}`);
        // 先删除原来绘制的形状
        findedNode.selectAll(".nodeGraph").remove();

        // 在这里指定组件的绘制顺序
        let addedNodeText = null;
        let addedNodeGraph = null;
        let addedNodeCircle = null;
        let addedNodeRect = null;
        if (nodeObj.autoGetValue("exterior_node", "shape") == "circle") {
            addedNodeGraph = findedNode.append("circle");
            addedNodeCircle = addedNodeGraph;
        } else if (nodeObj.autoGetValue("exterior_node", "shape") == "rect") {
            addedNodeGraph = findedNode.append("rect");
            addedNodeRect = addedNodeGraph;
        }
        if (nodeObj.hasComponent("text_node")) {
            addedNodeText = findedNode.append("text");
        }

        // 在这里绑定组件的属性
        if (addedNodeText)
            addedNodeText.style("z-index", 999)
                .attr("class", "nodeText nodeGraph")
                .style("text-anchor", "middle")
                .style("dominant-baseline", "middle")
                .style("cursor", "pointer")
                .text(d => d.autoGetValue("text_node", "showText", ""))
                .attr("fill", d => d.autoGetValue("text_node", "textColor", "#ffffff"))
                .style("font-size", d => d.autoGetValue("text_node", `textSize`, "2px", value => `${value}px`))
                .style("letter-spacing", d => d.autoGetValue("text_node", `textSpacing`, "0", value => `${value}px`))
                .style("font-weight", d => d.autoGetValue("text_node", "textWeight", 100, value => value * 100))

        if (addedNodeCircle)
            addedNodeCircle
                .attr("class", "nodeCircle nodeGraph")
                .style("cursor", "pointer")
                .attr("r", d => {
                    let radius = d.autoGetValue("exterior_node", "size", 0, value => value.x);
                    // 根据文字大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        if (d.hasComponent("text_node")) {
                            radius = Math.max(Math.abs(addedNodeText.node().getBBox().x), Math.abs(addedNodeText.node().getBBox().y)) + 8;
                        }
                    }
                    return radius;
                })
        if (addedNodeRect) {
            addedNodeRect
                .attr("class", "nodeRect nodeGraph")
                .style("cursor", "pointer")
                .attr("width", d => {
                    let width = d.autoGetValue("exterior_node", "size", 0, value => value.x);
                    // 根据文字大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        if (d.hasComponent("text_node")) {
                            width = Math.abs(addedNodeText.node().getBBox().x) * 2 + 8;
                        }
                    }
                    return width;
                })
                .attr("height", d => {
                    let height = d.autoGetValue("exterior_node", "size", 0, value => value.y);
                    // 根据文字大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        if (d.hasComponent("text_node")) {
                            height = Math.abs(addedNodeText.node().getBBox().y) * 2 + 8;
                        }
                    }
                    return height;
                })
                .attr("x", d => -d3.select(`#${d.uuid} .nodeRect`).attr("width") / 2)
                .attr("y", d => -d3.select(`#${d.uuid} .nodeRect`).attr("height") / 2)
        }
        addedNodeGraph
            .style("fill", d => d.autoGetValue("exterior_node", "bgColor", "#000000"))
            .style("stroke", d => d.autoGetValue("exterior_node", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_node", "strokeWidth", "1px", value => `${value}px`))
            .style("stroke-dasharray", d => d.autoGetValue("exterior_node", "strokeStyle", "0"));
        // 更新物理
        if (!load) {
            this.renderProperties.forces.collideForce
                .radius(d => {
                    let radius = d.autoGetValue("physics_node", "collisionRadius", 20);
                    if (d.autoGetValue("physics_node", "collisionRadiusAuto", false)) {
                        if (addedNodeCircle)
                            radius = d3.select(`#${d.uuid}`).select(".nodeGraph").attr("r");
                        if (addedNodeRect)
                            radius = Math.max(d3.select(`#${d.uuid} .nodeGraph`).attr("width"), d3.select(`#${d.uuid} .nodeGraph`).attr("height"));
                    }
                    return radius;
                });
            this.renderProperties.forces.chargeForce = d3.forceManyBody()
                .strength(d => d.autoGetValue("physics_node", "manyBodyForceStrength", -80, value => -value))
                .distanceMax(d => d.autoGetValue("physics_node", "manyBodyForceRangeMin", 10))
                .distanceMin(d => d.autoGetValue("physics_node", "manyBodyForceRangeMax", 12))
            this.renderProperties.simulation.restart();
        }
    }

    /**
     * 修改单个关系
     */
    modifyEdge(edgeObj, load = false) {
        const findedEdge = this.renderProperties.viewArea.select(`#${edgeObj.uuid}`);
        findedEdge
            .style("stroke", d => d.autoGetValue("exterior_edge", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_edge", "strokeWidth", "1px", value => `${value}px`))
            .style("stroke-dasharray", d => d.autoGetValue("exterior_edge", "strokeStyle", "0"));
        // 更新物理
        this.renderProperties.forces.linkForce
            .strength(d => d.autoGetValue("physics_edge", "linkStrength", 1))
            .distance(d => d.autoGetValue("physics_edge", "linkDistance", 400));
        this.renderProperties.simulation.alphaTarget(0.01).restart();
    }

    /**
     * 选择元素
     */
    selectElement(elementObj) {
        this.selectedElement = elementObj;
        elementObj.initHtml();
    }

    /**
     * 查找和node关联的edge
     */
    findNodeEdges(nodeObj) {
        let removeEdgeList = [];
        for (let i = 0; i < this.edgeList.length; i++) {
            let currentEdge = this.edgeList[i];
            if (currentEdge.source == nodeObj || currentEdge.target == nodeObj)
                removeEdgeList.push(currentEdge);
        }
        return removeEdgeList;
    }

    /**
     * 转为JSON
     */
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