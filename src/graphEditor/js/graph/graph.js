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
        // 背景颜色
        this.bgColor = "#ffffff";
        // 鼠标位置
        this.mouseX;
        this.mouseY;
    }

    /**
     * 向图谱中添加节点
     * @param {Node} node 要添加的节点
     */
    addNode(node) {
        if (node) {
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
    }

    /**
     * 向图谱中添加关系
     * @param {edge} edge 要添加的关系
     */
    addEdge(edge) {
        if (edge) {
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
                .strength(d => d.autoGetValue("physics_edge", "linkStrength", 1))
                .distance(d => d.autoGetValue("physics_edge", "linkDistance", 400));

            _.renderProperties.forces.chargeForce = d3.forceManyBody()
                .strength(d => d.autoGetValue("physics_node", "manyBodyForceStrength", -80, value => -value))
                .distanceMax(d => d.autoGetValue("physics_node", "manyBodyForceRangeMin", 10))
                .distanceMin(d => d.autoGetValue("physics_node", "manyBodyForceRangeMax", 12))

            _.renderProperties.forces.collideForce = d3.forceCollide()
                .radius(d => d.autoGetValue("physics_node", "collisionRadius", 20));

            // 创建物理模拟
            _.renderProperties.simulation = d3.forceSimulation()
                .force("link", _.renderProperties.forces.linkForce)
                .force("center", _.renderProperties.forces.centerForce)
                .force("charge", _.renderProperties.forces.chargeForce)
                .force("collide", _.renderProperties.forces.collideForce)
                .alphaDecay(1.1);
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

        // 设置节点颜色
        _.setBgColor(_.bgColor);

        // 绘制关系
        let edges = d3.select("#edgeLayer").selectAll(".forceLine")
            .data(_.edgeList, d => d.uuid)
            .enter()
            .append("line")
            .call(initEdges)
        this.edges = edges;

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
        this.nodes = nodes;

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
                // 双击转到编辑
                .on("dblclick", function () {
                    let nodeObj = d3.select(this).data()[0];
                    if (nodeObj.hasComponent("text_node")) {
                        document.querySelector("#text_node_textarea").focus();
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
            if (e.target == this && e.button == 0) {
                // 如果同时按着shift键，添加节点
                if (_.selectedElementList.length >= 1 && _.isShiftDown) {
                    let fromNode = _.selectedElementList[_.selectedElementList.length - 1];

                    // 添加节点
                    let addedNode = CreateTextNode();
                    // 计算鼠标在svg中的相对位置
                    let transform = d3.zoomTransform(_.renderProperties.viewArea.node());
                    let pt = transform.invert([e.x, e.y]);
                    addedNode.x = pt[0];
                    addedNode.y = pt[1];
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

                    _.deselectAll();
                    // 选中新添加的节点
                    _.selectElement(addedNode);
                } else {
                    // 取消选择
                    document.querySelector(".panArea .listPan").innerHTML = "";
                    document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
                }
                _.mouseX = e.offsetX;
                _.mouseY = e.offsetY;
            }
        });

        // 框选
        let clickTime = "";
        let startLoc = [];
        let endLoc = [];
        let selectionFlag = false;
        function selectionRect() {
            let rect = d3.select(".displayArea svg").append("rect")
                .attr("class","selectionRect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("transform", "translate(0,0)")
                .attr("id", "squareSelect");

            d3.select(".displayArea svg").on("mousedown", function (e) {
                if (e.button == 0) {
                    clickTime = (new Date()).getTime();
                    selectionFlag = true;
                    rect.attr("transform", "translate(" + e.layerX + "," + e.layerY + ")");
                    startLoc = [e.layerX, e.layerY];
                    _.deselectAll();
                }
            });

            d3.select(".displayArea svg").on("mousemove", function (e) {
                //判断事件target
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
            })

            d3.select(".displayArea svg").on("mouseup", function (e) {
                if (e.button == 0) {
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
                        for (let i = 0; i < _.copiedNodeJsonList.length; i++) {
                            let jsonString = _.copiedNodeJsonList[i];
                            let nodeStore = JSON.parse(jsonString);
                            let finalNodeStore = JSON.parse(_.copiedNodeJsonList[_.copiedNodeJsonList.length - 1]);
                            let oldUuid = nodeStore.uuid;
                            nodeStore.uuid = null;
                            // 计算鼠标在svg中的相对位置
                            let transform = d3.zoomTransform(_.renderProperties.viewArea.node());
                            let pt = transform.invert([_.mouseX, _.mouseY]);
                            nodeStore.x = nodeStore.x - finalNodeStore.x + pt[0];
                            nodeStore.y = nodeStore.y - finalNodeStore.y + pt[1];
                            nodeStore.cx = nodeStore.x + Math.random() / 100;
                            nodeStore.cy = nodeStore.y + Math.random() / 100;
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
                        }

                        // 粘贴edge
                        _.copiedEdgeJsonList.forEach(jsonString => {
                            let edgeStore = JSON.parse(jsonString);
                            if (oldNewUuid.has(edgeStore.source) && oldNewUuid.has(edgeStore.target)) {
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
            nodes.attr("transform", d => {
                if (d.autoGetValue("physics_node", "fixPosition")) {
                    d.fx = d.cx;
                    d.fy = d.cy;
                } else {
                    d.cx = d.x;
                    d.cy = d.y;
                }
                return `translate(${d.x},${d.y})`;
            });
        });

        // 缩放平移
        _.renderProperties.svg.call(d3.zoom()
            .extent([[0, 0], [this.renderProperties.svg.attr("width"), this.renderProperties.svg.attr("height")]])
            .scaleExtent([0.01, 30])

            // 右键操作
            .filter(e => {
                return e.button == 2 || e.type === "touchstart" || e instanceof WheelEvent
            })

            .on("zoom", ({ transform }) => {
                _.renderProperties.viewArea.attr("transform", transform);
            }))
            // 取消双击放大事件
            .on("dblclick.zoom", null);

        // 拖动
        function dragstarted(event, d) {
            if (!event.active) _.renderProperties.simulation.alphaTarget(0.02).restart();
            console.log(d);
            if (!d.autoGetValue("physics_node", "fixPosition")) {
                d.fx = d.x;
                d.fy = d.y;
            }
        }
        function dragged(event, d) {
            if (!d.autoGetValue("physics_node", "fixPosition")) {
                d.fx = event.x;
                d.fy = event.y;
            }
        }
        function dragended(event, d) {
            if (!event.active) _.renderProperties.simulation.alphaTarget(0.0001);
            d.fx = null;
            d.fy = null;
        }

        // 加载网络资源延迟
        window.setTimeout(() => {
            for (let node of _.nodeList) {
                _.modifyNodeExterior(node);
            }
        }, 3500);

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
        let addedNodeGraph = null;
        let addedNodeCircle = null;
        let addedNodeRect = null;

        let domAddedNodeText = null;
        let domAddedNodeLink = null;

        // 容器
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

        if (nodeObj.hasComponent("text_node"))
            domAddedNodeText = domAddedSubComponentContainer.append("xhtml:div");
        if (nodeObj.hasComponent("link_node"))
            domAddedNodeLink = domAddedSubComponentContainer.append("xhtml:a");

        // 在这里绑定组件的属性
        if (domAddedNodeText)
            domAddedNodeText
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

        if (domAddedNodeLink)
            domAddedNodeLink
                .attr("class", "nodeLink")
                .html("🔗")
                .style("display", "block")
                .style("margin", 0)
                .style("padding", "1px")
                .style("color", "rgb(200,200,200)")
                .style("font-size", "10px")
                .style("height", "max-content")
                .style("width", "max-content")
                .style("border-radius", "2px")
                .style("background-color", "rgb(50,50,50)")
                .style("cursor", "pointer")
                .style("text-decoration", "none")
                .attr("href", d => d.autoGetValue("link_node", "url"))
                .attr("target", "_blank")

        domAddedSubComponentContainer
            .style("display", "flex")
            .style("width", "max-content")
            .style("height", "max-content")
            .style("flex-direction", "column")
            .style("margin", 0)
            .style("padding", 0)
        domAddedSubComponentContainer.selectAll("*")
            .style("margin", 0)
            .style("padding", 0)

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
                        radius = Math.sqrt((addedSubComponentForeign.node().getBBox().width / 2) ** 2 + (addedSubComponentForeign.node().getBBox().height / 2) ** 2) + 8;
                    }
                    return radius;
                })
        if (addedNodeRect) {
            addedNodeRect
                .attr("class", "nodeRect nodeGraph")
                .style("cursor", "pointer")
                .attr("width", d => {
                    let width = d.autoGetValue("exterior_node", "size", 0, value => value.x);
                    // 根据内容大小来决定
                    if (d.autoGetValue("exterior_node", "sizeAuto", false)) {
                        width = Math.abs(addedSubComponentForeign.node().getBBox().width) + 8;
                    }
                    return width;
                })
                .attr("height", d => {
                    let height = d.autoGetValue("exterior_node", "size", 0, value => value.y);
                    // 根据内容大小来决定
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
        this.renderProperties.simulation.restart();
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
        this.renderProperties.simulation.alphaTarget(0.0).restart();
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
    exportSvg() {
        const svg = document.querySelector('svg');
        const source = new XMLSerializer().serializeToString(svg); //将整个SVG document 对象序列化为一个 XML 字符串。
        onDownload(source, 'text/xml', 'test.svg'); // 下载 
        function onDownload(data, type, name) {
            const blob = new Blob([data], { type }); // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
            const url = window.URL.createObjectURL(blob); //创建一个url
            const link = document.createElement('a'); //创建一个a标签
            link.href = url; // 把url 赋值给a标签的href
            link.style.display = 'none';
            link.setAttribute('download', name);
            document.body.appendChild(link);

            link.click(); // 触发a标签的点击事件
            URL.revokeObjectURL(url); // 清除Url
            document.body.removeChild(link);
        };
    }
    exportPng(scale = 5) {
        saveSvgAsPng(this.renderProperties.svg.node(), "vezz.png", {
            scale: scale
        });
    }

    /**
     * 设置背景颜色
     */
    setBgColor(color) {
        this.bgColor = color;
        this.renderProperties.svg.style("background-color", color);
    }

    /**
     * 清空图谱
     */
    clear() {
        for (let node of this.nodeList) {
            this.nodeList = [];
            this.edgeList = [];
            this.edges.filter(edge => {
                d3.select(`#${edge.uuid}`).remove();
                this.edges = this.edges.filter(currentEdge => { return currentEdge.uuid != edge.uuid });
            });
            this.nodes.filter(node => {
                d3.select(`#${node.uuid}`).remove();
                this.nodes = this.nodes.filter(currentNode => { return currentNode.uuid != node.uuid });
            });
            d3.selectAll(".layer").remove();
            d3.select(".viewArea").remove();
            //d3.selectAll("svg").selectAll("*").remove();
            // 重启物理模拟
            this.renderProperties.simulation.on("tick", () => { })
        }
    }

    /**
     * 加载数据
     */
    load(jsonObj) {
        let nodeJsonList = jsonObj.nodeList;
        let edgeJsonList = jsonObj.edgeList;
        for (let nodeJson of nodeJsonList) {
            let node = LoadNodeFromJson(nodeJson);
            this.addNode(node);
        }
        for (let edgeJson of edgeJsonList) {
            let edge = LoadEdgeFromJson(edgeJson, this.nodeList);
            this.addEdge(edge);
        }
        this.bgColor = jsonObj.bgColor;
        this.render();
    }

    /**
     * 转为JSON object
     */
    toJsonObj() {
        let jsonObj = {
            bgColor: this.bgColor,
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
        return jsonString;// .replace(/\\/g, "\\\\")
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
    graph.bgColor = jsonObj.bgColor;
    return graph;
}