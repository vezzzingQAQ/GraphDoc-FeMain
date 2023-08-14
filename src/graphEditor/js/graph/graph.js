/**
 * 类文档：
 * 
 * Graph
 * |_nodeList                 - 图谱的节点列表
 * |                          · 储存的是Node类指针
 * |_wdgeList                 - 图谱的关系列表
 * |                          · 储存edge类指针
 * |_selectedNodeList         - 被选中的节点的列表
 * |_renderProperties         - 渲染的参数集
 * |                          · 储存渲染的svg、viewAarea等参数，方便在不同的方法之间调用
 * |_addNode(node)            - 向图谱中添加节点
 * |_render()                 - 渲染图谱
 * |_modifyNodeExterior(node) - 修改特定node的参数，传入node类，自动寻找其DOM元素
 * |_modifyNodePhysics()   
 * |_modifyNodeExterior(node) - 修改特定edge的参数，传入edge类，自动寻找其DOM元素
 * |_modifyNodePhysics()   
 * |_selectElement(element)   - 选择一个指定的元素
 * |_toJsonObj()              - 将图谱转换为JsonObject
 * |_toJson()                 - 转为JSON字符串
 * |_clearRender()            - 清除所有的svg元素和力模拟数据 TODO
 * 
 * 从JSON生成图谱：
 * · 调用函数LoadGraphFromJson(jsonObj)来返回一个图谱类
 */

import * as d3 from "d3";
import { v4 as uuidv4 } from 'uuid';
import { CreateBasicEdge, CreateTextNode, LoadEdgeFromJson, LoadNodeFromJson } from "./element";
import { playMusic } from "../../../public/js/musicPlayer";
import { saveSvgAsPng } from "save-svg-png-ext";

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
        // 选择模式
        this.selectMode = "all";
        this.isShiftDown = false;
        this.isControlDown = false;
        // 图谱中的节点
        this.nodes;
        this.edges;
        // 复制的节点
        this.copiedNodeJsonList = [];
        this.copiedEdgeJsonList = [];
    }

    /**
     * 向图谱中添加节点
     * @param {Node} node 要添加的节点
     */
    addNode(node) {
        if (!this.nodeList.includes(node)) {
            if (!node.uuid) {
                let id = `zznode${uuidv4().split("-").join("")}`;
                node.uuid = id;
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
                edge.uuid = id;
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

        function initPhysics() {
            // 创建所需要的力
            _.renderProperties.forces.linkForce = d3.forceLink()
                .links(_.edgeList)
                .id(d => d.uuid)
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
        }
        initPhysics();

        function initSvg() {
            // 创建画布
            _.renderProperties.svg = d3.select(".displayArea svg")
                .attr("width", renderDom.offsetWidth)
                .attr("height", renderDom.offsetHeight)

            // 创建绘画区域
            _.renderProperties.viewArea = _.renderProperties.svg.append("g")
                .attr("class", "viewArea")

            // 创建图层-节点层和关系层
            d3.select(".viewArea").append("g")
                .attr("class", "edgeLayer layer")
                .attr("id", "edgeLayer")

            d3.select(".viewArea").append("g")
                .attr("class", "nodeLayer layer")
                .attr("id", "nodeLayer")
        }
        initSvg();

        // 绘制关系
        let edges = d3.select("#edgeLayer").selectAll(".forceLine")
            .data(_.edgeList, d => d.uuid)
            .enter()
            .append("line")
            .call(initEdges)

        function initEdges(edges) {
            edges
                .attr("id", d => d.uuid)
                .style("cursor", "pointer")
                .on("click", function (d, i) {
                    let edgeObj = d3.select(this).data()[0];
                    let edge = d3.select(this);
                    _.deselectAll();
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
        }

        // 绘制node
        let nodes = d3.select("#nodeLayer").selectAll(".forceNode")
            .data(_.nodeList, d => d.uuid)
            .enter()
            .append("g")
            .call(initNodes);

        function initNodes(nodes) {
            nodes
                .attr("id", d => d.uuid)
                // 点击选中
                .on("click", function () {
                    let nodeObj = d3.select(this).data()[0];
                    // 按下shift的同时点击另一个节点，创建关系
                    if (_.isShiftDown && _.selectedElementList.length >= 1) {
                        let fromNode = _.selectedElementList[_.selectedElementList.length - 1];
                        // 遍历所有链接判断是不是已经链接过了
                        let isLinked = false;
                        for (let edge of _.edgeList) {
                            if (edge.source == fromNode && edge.target == nodeObj) {
                                isLinked = true;
                                break;
                            }
                        }
                        // 没连过就连上
                        if (!isLinked) {
                            let addedEdge = CreateBasicEdge(fromNode, nodeObj);
                            addedEdge.autoSetValue("physics_edge", "linkDistance", Math.sqrt((fromNode.x - nodeObj.x) ** 2 + (fromNode.y - nodeObj.y) ** 2));
                            _.addEdge(addedEdge);

                            // 绘制
                            edges = edges
                                .data(_.edgeList, d => d.uuid)
                                .enter()
                                .append("line")
                                .call(initEdges)
                                .merge(edges);

                            // 初始化组件
                            _.modifyEdgeExterior(addedEdge);
                            _.modifyEdgePhysics();
                        }
                    }
                    // 清除选择集
                    _.deselectAll();
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

        }

        function initElements() {
            // 开始的时候先全部更新一遍，装入数据
            for (let node of _.nodeList) {
                _.modifyNodeExterior(node);
            }
            for (let edge of _.edgeList) {
                _.modifyEdgeExterior(edge);
            }
            _.modifyNodePhysics();
            _.modifyEdgePhysics();
        }
        initElements();

        // 点击空白处
        d3.select(".displayArea svg").on("click", function (e) {
            if (e.target == this) {
                // 如果同时按着shift键，添加节点
                if (_.selectedElementList.length >= 1 && _.isShiftDown) {
                    let fromNode = _.selectedElementList[_.selectedElementList.length - 1];

                    // 添加节点
                    let addedNode = CreateTextNode();
                    addedNode.x = e.offsetX;
                    addedNode.y = e.offsetY;
                    _.addNode(addedNode);

                    // 添加关系
                    let addedEdge = CreateBasicEdge(fromNode, addedNode);
                    addedEdge.autoSetValue("physics_edge", "linkDistance", Math.sqrt((fromNode.x - addedNode.x) ** 2 + (fromNode.y - addedNode.y) ** 2));
                    _.addEdge(addedEdge);

                    // 绘制
                    edges = edges
                        .data(_.edgeList, d => d.uuid)
                        .enter()
                        .append("line")
                        .call(initEdges)
                        .merge(edges);
                    nodes = nodes
                        .data(_.nodeList, d => d.uuid)
                        .enter()
                        .append("g")
                        .call(initNodes)
                        .merge(nodes);

                    // 初始化组件
                    _.modifyEdgeExterior(addedEdge);
                    _.modifyEdgePhysics();
                    _.modifyNodeExterior(addedNode);
                    _.modifyNodePhysics();
                }
                // 取消选择
                _.deselectAll();
                document.querySelector(".panArea .listPan").innerHTML = "";
                document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
            }
        });

        // 框选
        let clickTime = "";
        let startLoc = [];
        let endLoc = [];
        let selectionFlag = false;
        function selectionRect() {
            let rect = d3.select(".displayArea svg").append("rect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("fill", "rgba(33,20,50,0.3)")
                .attr("stroke", "#ccc")
                .attr("stroke-width", "2px")
                .attr("transform", "translate(0,0)")
                .attr("id", "squareSelect");

            d3.select(".displayArea svg").on("mousedown", function (e) {
                if (e.button == 2) {
                    clickTime = (new Date()).getTime();
                    selectionFlag = true;
                    rect.attr("transform", "translate(" + e.layerX + "," + e.layerY + ")");
                    startLoc = [e.layerX, e.layerY];
                    _.deselectAll();
                }
            });

            d3.select(".displayArea svg").on("mousemove", function (e) {
                //判断事件target
                //if (e.button == 2) {
                if (e.target.localName == "svg" && selectionFlag == true || e.target.localName == "rect" && selectionFlag == true) {

                    let width = e.layerX - startLoc[0];
                    let height = e.layerY - startLoc[1];
                    if (width < 0) {
                        rect.attr("transform", "translate(" + e.layerX + "," + startLoc[1] + ")");
                    }
                    if (height < 0) {
                        rect.attr("transform", "translate(" + startLoc[0] + "," + e.layerY + ")");
                    }
                    if (height < 0 && width < 0) {
                        rect.attr("transform", "translate(" + e.layerX + "," + e.layerY + ")");
                    }
                    rect.attr("width", Math.abs(width)).attr("height", Math.abs(height))
                }
                //}
            })

            d3.select(".displayArea svg").on("mouseup", function (e) {
                if (e.button == 2) {
                    if (selectionFlag == true) {
                        selectionFlag = false;
                        endLoc = [e.layerX, e.layerY];
                        let leftTop = [];
                        let rightBottom = []
                        if (endLoc[0] >= startLoc[0]) {
                            leftTop[0] = startLoc[0];
                            rightBottom[0] = endLoc[0];
                        } else {
                            leftTop[0] = endLoc[0];
                            rightBottom[0] = startLoc[0];
                        }

                        if (endLoc[1] >= startLoc[1]) {
                            leftTop[1] = startLoc[1];
                            rightBottom[1] = endLoc[1];
                        } else {
                            leftTop[1] = endLoc[1];
                            rightBottom[1] = startLoc[1];
                        }

                        // 通过和node的坐标比较，确定哪些点在圈选范围
                        if ("all" || _.selectMode == "node") {
                            let nodes = d3.selectAll(".forceNode").attr("temp", function (d) {
                                let node = d3.select(this).node();
                                let nodePosition = {
                                    x: node.getBoundingClientRect().x,
                                    y: node.getBoundingClientRect().y
                                }
                                if (nodePosition.x < rightBottom[0] && nodePosition.x > leftTop[0] && nodePosition.y > leftTop[1] && nodePosition.y < rightBottom[1]) {
                                    _.selectElement(d3.select(this).data()[0]);
                                }
                            });
                        }
                        if ("all" || _.selectMode == "edge") {
                            let edges = d3.selectAll(".forceEdge").attr("temp", function (d) {
                                let node1 = d3.select(`#${d.source.uuid}`).node();
                                let node2 = d3.select(`#${d.target.uuid}`).node();
                                let nodePosition = {
                                    x1: node1.getBoundingClientRect().x,
                                    y1: node1.getBoundingClientRect().y,
                                    x2: node2.getBoundingClientRect().x,
                                    y2: node2.getBoundingClientRect().y
                                }
                                if (
                                    (nodePosition.x1 < rightBottom[0] && nodePosition.x1 > leftTop[0] && nodePosition.y1 > leftTop[1] && nodePosition.y1 < rightBottom[1]) &&
                                    (nodePosition.x2 < rightBottom[0] && nodePosition.x2 > leftTop[0] && nodePosition.y2 > leftTop[1] && nodePosition.y2 < rightBottom[1])
                                ) {
                                    _.selectElement(d3.select(this).data()[0]);
                                }
                            });
                        }
                        if (_.selectedElementList.length > 1) {
                            document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
                            document.querySelector(".panArea .listPan").innerHTML = "";
                        }
                        rect.attr("width", 0).attr("height", 0);
                    }
                    let times = (new Date()).getTime() - clickTime;
                    if (times < 100) {
                        _.deselectAll();
                    }
                }
            })
        }
        selectionRect();

        function bindKeyEvent() {
            // 选中节点后delete删除
            d3.select("body").on("keydown", function (e) {
                if (e.target == this) {
                    // delete删除选中的元素
                    if (e.keyCode == 46) {
                        if (_.selectedElementList.length != 0) {
                            for (let selectedElement of _.selectedElementList) {
                                if (selectedElement.type == "node") {
                                    // 移除相关关系
                                    let removeEdgeList = _.findNodeEdges(selectedElement);
                                    for (let i = 0; i < removeEdgeList.length; i++) {
                                        let currentRemoveEdge = removeEdgeList[i];
                                        if (_.edgeList.indexOf(currentRemoveEdge) != -1) {
                                            _.edgeList.splice(_.edgeList.indexOf(currentRemoveEdge), 1);
                                            d3.select(`#${currentRemoveEdge.uuid}`).remove();
                                            edges = edges.filter(edge => { return edge.uuid != currentRemoveEdge.uuid });
                                        }
                                    }
                                    // 移除节点
                                    if (_.nodeList.indexOf(selectedElement) != -1) {
                                        _.nodeList.splice(_.nodeList.indexOf(selectedElement), 1);
                                        d3.select(`#${selectedElement.uuid}`).remove();
                                        nodes = nodes.filter(node => { return node.uuid != selectedElement.uuid });
                                    }
                                } else if (selectedElement.type == "edge") {
                                    // 移除关系
                                    if (_.edgeList.indexOf(selectedElement) != -1) {
                                        _.edgeList.splice(_.edgeList.indexOf(selectedElement), 1);
                                        d3.select(`#${selectedElement.uuid}`).remove();
                                        edges = edges.filter(edge => { return edge.uuid != selectedElement.uuid });
                                    }
                                }
                                // 重启物理模拟
                                _.modifyNodePhysics();
                                _.modifyEdgePhysics();
                            }
                        }
                    }
                    if (e.keyCode == 16)
                        _.isShiftDown = true;
                    if (e.keyCode == 17)
                        _.isControlDown = true;
                    // ctrl+c复制选中的节点
                    if (e.keyCode == 67 && _.isControlDown) {
                        _.copiedNodeJsonList = [];
                        _.copiedEdgeJsonList = [];
                        for (let i = 0; i < _.selectedElementList.length; i++) {
                            let currentElement = _.selectedElementList[i];
                            if (currentElement.type == "node") {
                                _.copiedNodeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
                            } else if (currentElement.type == "edge") {
                                _.copiedEdgeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
                            }
                        }
                    }
                    // ctrl+v粘贴元素
                    if (e.keyCode == 86 && _.isControlDown) {
                        // 记录新旧键值对
                        let oldNewUuid = new Map();

                        // 粘贴node
                        _.copiedNodeJsonList.forEach(jsonString => {
                            let nodeStore = JSON.parse(jsonString);
                            let oldUuid = nodeStore.uuid;
                            nodeStore.uuid = null;
                            nodeStore.x = Math.random() * 100;
                            nodeStore.y = Math.random() * 100;
                            let loadedNode = LoadNodeFromJson(nodeStore);
                            _.addNode(loadedNode);

                            oldNewUuid.set(oldUuid, loadedNode.uuid);

                            nodes = nodes
                                .data(_.nodeList, d => d.uuid)
                                .enter()
                                .append("g")
                                .call(initNodes)
                                .merge(nodes);

                            _.modifyNodeExterior(loadedNode);
                        });

                        // 粘贴edge
                        _.copiedEdgeJsonList.forEach(jsonString => {
                            let edgeStore = JSON.parse(jsonString);
                            if (oldNewUuid.has(edgeStore.source) && oldNewUuid.has(edgeStore.target)) {
                                console.log(edgeStore.source, oldNewUuid.get(edgeStore.source))
                                edgeStore.source = oldNewUuid.get(edgeStore.source);
                                edgeStore.target = oldNewUuid.get(edgeStore.target);
                                edgeStore.uuid = null;
                                let loadedEdge = LoadEdgeFromJson(edgeStore, _.nodeList);
                                _.addEdge(loadedEdge);

                                edges = edges
                                    .data(_.edgeList, d => d.uuid)
                                    .enter()
                                    .append("line")
                                    .call(initEdges)
                                    .merge(edges);

                                _.modifyEdgeExterior(loadedEdge);
                            }
                        });

                        _.modifyNodePhysics();
                        _.modifyEdgePhysics();
                    }
                    // Debug输出
                    if (e.keyCode == 68 && _.isShiftDown) {
                        console.log("------------------------------------")
                        console.log("nodelist", _.nodeList);
                        console.log("nodes", nodes);
                        console.log("edgelist", _.edgeList);
                        console.log("edges", edges)
                    }
                }
            });
            d3.select("body").on("keyup", function (e) {
                if (e.target == this) {
                    if (e.keyCode == 16) {
                        _.isShiftDown = false;
                    } else if (e.keyCode == 17) {
                        _.isControlDown = false;
                    }
                }
            });
        }
        bindKeyEvent();

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
    modifyNodeExterior(nodeObj) {
        const findedNode = this.renderProperties.viewArea.select(`#${nodeObj.uuid}`);
        // 先删除原来绘制的形状
        findedNode.selectAll(".nodeGraph").remove();
        findedNode.selectAll(".nodeGraphContainer").remove();

        // 在这里指定组件的绘制顺序
        let domAddedNodeText = null;
        let addedNodeGraph = null;
        let addedNodeCircle = null;
        let addedNodeRect = null;

        let addedSubComponentForeign = null;
        let domAddedSubComponentContainer = null;

        if (nodeObj.autoGetValue("exterior_node", "shape") == "circle") {
            addedNodeGraph = findedNode.append("circle");
            addedNodeCircle = addedNodeGraph;
        } else if (nodeObj.autoGetValue("exterior_node", "shape") == "rect") {
            addedNodeGraph = findedNode.append("rect");
            addedNodeRect = addedNodeGraph;
        }

        addedSubComponentForeign = findedNode.append("foreignObject").attr("class", "nodeGraphContainer");
        domAddedSubComponentContainer = addedSubComponentForeign.append("xhtml:body").attr("class", "nodeGraphDomContainer");

        if (nodeObj.hasComponent("text_node")) {
            domAddedNodeText = domAddedSubComponentContainer.append("xhtml:div");
        }

        // 在这里绑定组件的属性
        if (domAddedNodeText)
            domAddedNodeText.style("z-index", 999)
                .attr("class", "nodeText")
                .style("width", "max-content")
                .style("height", "max-content")
                .style("text-anchor", "middle")
                .style("dominant-baseline", "middle")
                .style("cursor", "pointer")
                .html(d => {
                    let rawText = d.autoGetValue("text_node", "showText", "");
                    let retText = rawText.replace(/\n/g, "<div></div>");
                    return retText;
                })
                .style("color", d => d.autoGetValue("text_node", "textColor", "#ffffff"))
                .style("font-size", d => d.autoGetValue("text_node", `textSize`, "2px", value => `${value}px`))
                .style("letter-spacing", d => d.autoGetValue("text_node", `textSpacing`, "0", value => `${value}px`))
                .style("font-weight", d => d.autoGetValue("text_node", "textWeight", 100, value => value * 100))

        domAddedSubComponentContainer
            .style("display", "flex")
            .style("width", "max-content")
            .style("height", "max-content")
            .style("z-index", 1);

        addedSubComponentForeign
            .attr("width", function () {
                let containerDom = d3.select(this).select(".nodeGraphDomContainer");
                return containerDom.node().offsetWidth;
            })
            .attr("height", function () {
                let containerDom = d3.select(this).select(".nodeGraphDomContainer");
                return containerDom.node().offsetHeight;
            })
            .attr("x", function () { return -d3.select(this).attr("width") / 2 })
            .attr("y", function () { return -d3.select(this).attr("height") / 2 })

        if (addedNodeCircle)
            addedNodeCircle
                .attr("class", "nodeCircle nodeGraph")
                .style("cursor", "pointer")
                .attr("r", d => {
                    let radius = d.autoGetValue("exterior_node", "size", 0, value => value.x);
                    // 根据文字大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        if (d.hasComponent("text_node")) {
                            radius = Math.sqrt((addedSubComponentForeign.node().getBBox().width / 2) ** 2 + (addedSubComponentForeign.node().getBBox().height / 2) ** 2) + 8;
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
                            width = Math.abs(addedSubComponentForeign.node().getBBox().width) + 8;
                        }
                    }
                    return width;
                })
                .attr("height", d => {
                    let height = d.autoGetValue("exterior_node", "size", 0, value => value.y);
                    // 根据文字大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        if (d.hasComponent("text_node")) {
                            height = Math.abs(addedSubComponentForeign.node().getBBox().height) + 8;
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
    }

    /**
     * 修改节点的物理表现
     */
    modifyNodePhysics() {
        this.renderProperties.simulation.nodes(this.nodeList)
        this.renderProperties.forces.collideForce
            .radius(d => {
                let radius = d.autoGetValue("physics_node", "collisionRadius", 20);
                if (d.autoGetValue("physics_node", "collisionRadiusAuto", false)) {
                    if (d.autoGetValue("exterior_node", "shape") == "circle")
                        radius = d3.select(`#${d.uuid} .nodeGraph`).attr("r") * 1.2;
                    else if (d.autoGetValue("exterior_node", "shape") == "rect")
                        radius = Math.sqrt((d3.select(`#${d.uuid} .nodeGraphContainer`).node().getBBox().width / 2) ** 2 + (d3.select(`#${d.uuid} .nodeGraphContainer`).node().getBBox().height / 2) ** 2) * 1.2;
                }
                return radius;
            });
        this.renderProperties.forces.chargeForce = d3.forceManyBody()
            .strength(d => d.autoGetValue("physics_node", "manyBodyForceStrength", -80, value => -value))
            .distanceMax(d => d.autoGetValue("physics_node", "manyBodyForceRangeMin", 10))
            .distanceMin(d => d.autoGetValue("physics_node", "manyBodyForceRangeMax", 12))
        this.renderProperties.simulation.restart();
    }

    /**
     * 修改单个关系
     */
    modifyEdgeExterior(edgeObj) {
        const findedEdge = this.renderProperties.viewArea.select(`#${edgeObj.uuid}`);
        findedEdge
            .style("stroke", d => d.autoGetValue("exterior_edge", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_edge", "strokeWidth", "1px", value => `${value}px`))
            .style("stroke-dasharray", d => d.autoGetValue("exterior_edge", "strokeStyle", "0"));
    }

    /**
     * 修改关系的物理表现
     */
    modifyEdgePhysics() {
        this.renderProperties.forces.linkForce
            .links(this.edgeList)
            .id(d => d.uuid)
            .strength(d => d.autoGetValue("physics_edge", "linkStrength", 1))
            .distance(d => d.autoGetValue("physics_edge", "linkDistance", 400));
        this.renderProperties.simulation.alphaTarget(0.01).restart();
    }

    /**
     * 选择元素
     */
    selectElement(elementObj) {
        let element = d3.select(`#${elementObj.uuid}`);
        if (elementObj.type == "node") {
            element.attr("class", "forceNode forceElement selected");
        } else if (elementObj.type == "edge") {
            element.attr("class", "forceEdge forceElement selected");
        }
        this.selectedElementList.push(elementObj);
        elementObj.initHtml();
    }

    /**
     * 取消选择
     */
    deselectElement(elementObj) {
        let element = d3.select(`#${elementObj.uuid}`);
        if (elementObj.type == "node") {
            element.attr("class", "forceNode forceElement unselected");
        } else if (elementObj.type == "edge") {
            element.attr("class", "forceEdge forceElement unselected");
        }
        if (this.selectedElementList.includes(elementObj)) {
            this.selectedElementList.splice(this.selectedElementList.indexOf(elementObj), 1);
        }
    }

    /**
     * 全部取消选择
     */
    deselectAll() {
        for (let nodeObj of this.nodeList) {
            this.deselectElement(nodeObj);
        }
        for (let edgeObj of this.edgeList) {
            this.deselectElement(edgeObj);
        }
        this.selectedElementList = [];
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
     * 下载为图片
     */
    exportImg(scale = 5) {
        saveSvgAsPng(this.renderProperties.svg.node(), "vezz.png", { 
            scale: scale
         });
    }

    /**
     * 转为JSON object
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
            if (edge.target && edge.source && edge)
                jsonObj.edgeList.push(edge.toJsonObj());
        }
        return jsonObj;
    }

    /**
     * 转为JSON
     */
    toJson() {
        let jsonString = JSON.stringify(this.toJsonObj());
        return jsonString.replace(/\\/g, "\\\\");
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