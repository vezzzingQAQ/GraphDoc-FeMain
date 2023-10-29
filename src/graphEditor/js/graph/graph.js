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
 * |_pushNode(node)            - 向图谱中添加节点
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
import { v4 as uuidv4 } from "uuid";
import hljs from "highlight.js";
import "highlight.js/styles/ir-black.css";
import { marked } from "marked";
import katex from "katex";
import QRCode from "qrcode";
import loadingImg from "./../../../asset/img/loadingImg.jpg";

import { CreateBasicEdge, CreateBasicNode, CreateCodeNode, CreateImgNode, CreateLatexNode, CreateLinkNode, CreateMdNode, CreateTextNode, CreateVideoNode, LoadEdgeFromJson, LoadNodeFromJson } from "./element";
import { playMusic } from "../../../public/js/musicPlayer";

import {
    IMG_UPLOAD_PATH,
    IMG_STORE_PATH,
    FILE_UPLOAD_PATH,
    FILE_STORE_PATH,
    VIDEO_UPLOAD_PATH,
    VIDEO_STORE_PATH,
    FUNC1_COMP
} from "../../../public/js/urls"
import { hideLoadingPage, saveGraph, showLoadingPage, showMessage } from "../event";
import { extractText } from "../../../public/js/serverCom";
import { setMarkerColors } from "./marker";
import { getOS } from "../../../public/js/tools";

// 撤销步数
const UNDO_STEP = 50;
// 格点大小
const BLOCK_SIZE = 10;
// 自动换行每一行的最大长度
const MAX_LINE_LENGTH = 40;

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
        this.isShiftDown = false;
        this.isControlDown = false;
        this.isAltDown = false;
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
        // 是否正在展示右键菜单
        this.isShowRightMenu = false;
        // 是否正在平移缩放
        this.isZooming = false;
        // 贝塞尔曲线参数
        this.bezierLarge = 100;
        this.bezierSmall = 10;
        // 撤销
        this.undoMirror = [];
        // 格点对齐
        this.alignBlock = false;
        // 锁定模式
        this.locked = false;
        // blob暂存列表
        this.blobTempList = [];
        // 上一个修改过的关系
        this.edgePrevJson = null;
        // 是否显示坐标系
        this.isShowCoord = false;
        // 判断所处的操作系统
        this.os = getOS();
    }

    /**
     * 向图谱中添加节点
     * @param {Node} node 要添加的节点
     */
    pushNode(node) {
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
    pushEdge(edge) {
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
    render(refreshViewArea = false) {

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
            if (!refreshViewArea) {
                if (!_.renderProperties.viewArea)
                    _.renderProperties.viewArea = _.renderProperties.svg.append("g")
                        .attr("class", "viewArea")
            } else {
                if (d3.select(".viewArea"))
                    d3.select(".viewArea").remove();
                _.renderProperties.viewArea = _.renderProperties.svg.append("g")
                    .attr("class", "viewArea")
            }

            // 创建图层-底面层节点层和关系层
            d3.select(".viewArea").append("g")
                .attr("class", "bottomLayer layer")
                .attr("id", "bottomLayer")

            d3.select(".viewArea").append("g")
                .attr("class", "edgeLayer layer")
                .attr("id", "edgeLayer")

            d3.select(".viewArea").append("g")
                .attr("class", "nodeLayer layer")
                .attr("id", "nodeLayer")

            // 绘制坐标
            function drawCoord() {
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(-50000, 0);
                        path.lineTo(50000, 0);
                        return path.toString();
                    })
                    .style("stroke", "rgba(150,150,150,1)");
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(0, -50000);
                        path.lineTo(0, 50000);
                        return path.toString();
                    })
                    .style("stroke", "rgba(150,150,150,1)");
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(_.renderProperties.svg.attr("width") / 2, -50000);
                        path.lineTo(_.renderProperties.svg.attr("width") / 2, 50000);
                        return path.toString();
                    })
                    .style("stroke", "rgba(250,150,150,1)");
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(-50000, _.renderProperties.svg.attr("height") / 2);
                        path.lineTo(50000, _.renderProperties.svg.attr("height") / 2);
                        return path.toString();
                    })
                    .style("stroke", "rgba(250,150,150,0.8)");
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(_.renderProperties.svg.attr("width"), -50000);
                        path.lineTo(_.renderProperties.svg.attr("width"), 50000);
                        return path.toString();
                    })
                    .style("stroke", "rgba(50,150,150,0.8)");
                d3.select("#bottomLayer").append("path")
                    .attr("class", "coordLine")
                    .attr("d", () => {
                        let path = d3.path();
                        path.moveTo(-50000, _.renderProperties.svg.attr("height"));
                        path.lineTo(50000, _.renderProperties.svg.attr("height"));
                        return path.toString();
                    })
                    .style("stroke", "rgba(50,150,150,0.8)");
                d3.selectAll(".coordLine")
                    .style("fill", "none")
                    .style("opacity", _.isShowCoord ? 1 : 0)
                    .style("stroke-width", 1)
                    .style("transition", "0.3s ease-in-out");
            }
            drawCoord();
        }
        initSvg();

        // 设置节点颜色
        _.setBgColor(_.bgColor);

        // 绘制关系
        _.edges = d3.select("#edgeLayer").selectAll(".forceLine")
            .data(_.edgeList, d => d.uuid)
            .enter()
            .append("g")
            .call(d => {
                _.initEdges(d);
            });

        // 绘制node
        _.nodes = d3.select("#nodeLayer").selectAll(".forceNode")
            .data(_.nodeList, d => d.uuid)
            .enter()
            .append("g")
            .call(d => {
                _.initNodes(d);
            });

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

        // 点击空白处&设置mouseXY
        d3.select(".displayArea")
            .on("click", function (e) {
                if (e.button == 0 && e.target == this) {
                    // 如果同时按着shift键，添加节点
                    if (_.selectedElementList.length >= 1 && _.isShiftDown) {
                        let fromNode = _.selectedElementList.length >= 1 ? _.selectedElementList[_.selectedElementList.length - 1] : null;
                        _.addNode(e, fromNode);

                    } else {
                        // 取消选择
                        document.querySelector(".panArea .listPan").innerHTML = "";
                        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
                    }
                }
                if (_.isShowRightMenu)
                    _.hideMenu();
            })
            .on("mousemove", function (e) {
                _.mouseX = e.offsetX;
                _.mouseY = e.offsetY;
            })

        if (!_.locked) {
            // 编辑模式
            // 初始化框选
            _.initSelectionRect();

            // 初始化窗口的键盘事件绑定
            function bindKeyEvent() {
                d3.select("body").on("keydown", function (e) {
                    if (e.target == this) {
                        console.log(e.keyCode);
                        // delete或backspace删除选中的元素
                        if (e.keyCode == 46 || e.keyCode == 8) {
                            if (_.selectedElementList.length != 0) {
                                // 压入撤销列表
                                _.pushUndo();
                                for (let selectedElement of _.selectedElementList) {
                                    _.deleteElement(selectedElement);
                                }
                                // 更新底部栏
                                _.refreshBottomDom("🔑已按下delete，删除元素");

                                // 重启物理模拟
                                _.modifyNodePhysics();
                                _.modifyEdgePhysics();
                            }
                        }
                        if (e.keyCode == 16) {
                            // 更新底部栏
                            _.refreshBottomDom("🔑已按下shift，点击元素进行连接");
                            _.isShiftDown = true;
                        }
                        // 
                        if (_.os == "Windows") {
                            if (e.keyCode == 17) {
                                // 更新底部栏
                                _.refreshBottomDom("🔑已按下ctrl，点击元素进行加选，或者按下C/V进行复制粘贴");
                                _.isControlDown = true;
                            }
                        } else if (_.os == "Mac") {
                            if (e.keyCode == 91) {
                                // 更新底部栏
                                _.refreshBottomDom("🔑已按下ctrl，点击元素进行加选，或者按下C/V进行复制粘贴");
                                _.isControlDown = true;
                            }
                        }
                        // alt
                        if (e.keyCode == 18) {
                            _.isAltDown = true;
                        }
                        // ctrl+c复制选中的节点
                        if (e.keyCode == 67 && _.isControlDown) {
                            _.copyElements();
                        }
                        // ctrl+x剪切选中的节点
                        if (e.keyCode == 88 && _.isControlDown) {
                            _.cutElements();
                        }
                        // ctrl+v粘贴元素
                        if (e.keyCode == 86 && _.isControlDown) {
                            _.pasteElements();
                        }
                        // ctrl+z撤销
                        if (e.keyCode == 90 && _.isControlDown) {
                            _.undo();
                            _.isControlDown = false;
                        }
                        // ctrls保存
                        if (e.keyCode == 83 && _.isControlDown) {
                            e.preventDefault();
                            saveGraph(_);
                        }
                        // tab
                        if (e.keyCode == 9 && _.selectedElementList.length > 0) {
                            // let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                            // if (selectedNodeList.length > 0) {
                            //     let curNode = selectedNodeList[selectedNodeList.length - 1];
                            //     let addedNode = _.addNode({ x: _.mouseX, y: _.mouseY }, "text");
                            //     let addedEdge = _.addEdge(curNode, addedNode);
                            //     _.deselectAll();
                            //     _.selectElement(addedNode);
                            //     addedNode.initHtml();
                            // }
                        }

                        // shift+D debug输出
                        if (e.keyCode == 68 && _.isShiftDown) {
                            console.log("Graph Doc Debug Mode")
                            console.log("nodelist", _.nodeList);
                            console.log("nodes", _.nodes);
                            console.log("edgelist", _.edgeList);
                            console.log("edges", _.edges);
                            console.log("selectedElementList", _.selectedElementList);
                            console.log("copiedNodes", _.copiedNodeJsonList);
                            console.log("cpoiedEdges", _.copiedEdgeJsonList);
                            console.log("isControlDown", _.isControlDown);
                            console.log("isShiftDown", _.isShiftDown);
                            console.log("isAltDown", _.isAltDown);
                        }
                    }
                });
                d3.select("body").on("keyup", function (e) {
                    if (e.target == this) {
                        if (e.keyCode == 16)
                            _.isShiftDown = false;
                        if (_.os == "Windows") {
                            if (e.keyCode == 17)
                                _.isControlDown = false;
                        } else if (_.os == "Mac") {
                            if (e.keyCode == 91)
                                _.isControlDown = false;
                        }
                        if (e.keyCode == 18)
                            _.isAltDown = false;
                    }
                });
            }
            bindKeyEvent();

            // 初始化窗口右键菜单
            function initRightMenu() {
                d3.select(".displayArea svg").on("contextmenu", function (e) {
                    if (e.target == this) {
                        e.preventDefault();
                        if (!_.isZooming) {
                            _.initMenu_Svg(e);
                        } else {
                            _.hideMenu();
                        }
                    }
                });
            }
            initRightMenu();

            // 绑定节点的drag事件
            _.initDragEvents(_.nodes);
        } else {
            // 浏览模式
            d3.select(".displayArea svg").on("contextmenu", function (e) {
                if (e.target == this) {
                    e.preventDefault();
                }
            });
        }

        // 计算物理模拟
        _.calPhysics();

        // 缩放平移
        _.initZoomEvents();

    }

    /**
     * 生成EDGE
     */
    initEdges(edges) {
        let _ = this;
        edges
            .attr("id", d => d.uuid)
            .append("path")
            .style("cursor", "pointer")
            .on("click", function (d, i) {
                // 更新底部元素
                _.refreshBottomDom("✨已选择关系，可以在右侧的属性面板修改关系的属性");
                let edgeObj = d3.select(this).data()[0];
                let edge = d3.select(this);
                // 清除选择集
                if (!_.isShiftDown && !_.isControlDown) {
                    _.deselectAll();
                }
                // 按下ctrl减选
                if (_.isControlDown && _.selectedElementList.includes(edgeObj)) {
                    _.deselectElement(edgeObj);
                } else {
                    _.selectElement(edgeObj);
                }
                // 计算公有属性
                if (_.selectedElementList.length > 1) {
                    _.calPublicProperties();
                } else {
                    edgeObj.initHtml();
                }

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
            })
            .on("contextmenu", function (e) {
                e.preventDefault();
                if (!_.isZooming) {
                    let edgeObj = d3.select(this).data()[0];
                    _.initMenu_Edge(e, edgeObj);
                } else {
                    _.hideMenu();
                }
            });
    }

    /**
     * 生成NODE
     */
    initNodes(nodes) {
        let _ = this;

        nodes
            .attr("id", d => d.uuid)
            // 点击选中
            .on("click", function () {
                let nodeObj = d3.select(this).data()[0];
                // let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                // 更新底部元素
                _.refreshBottomDom("✨已选择节点，可以在右侧的属性面板修改节点的属性，双击节点编辑文字，按下shift创建关系");
                // 清除选择集
                if (!_.isShiftDown && !_.isControlDown) {
                    _.deselectAll();
                }
                // 按下ctrl减选
                if (_.isControlDown && _.selectedElementList.includes(nodeObj)) {
                    _.deselectElement(nodeObj);
                } else {
                    _.selectElement(nodeObj);
                }
                // 计算公有属性
                if (_.selectedElementList.length > 1) {
                    _.calPublicProperties();
                } else {
                    nodeObj.initHtml();
                }
            })
            .on("mousedown", function () {
                let nodeObj = d3.select(this).data()[0];
                let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                // 更新底部元素
                _.refreshBottomDom("✨已选择节点，可以在右侧的属性面板修改节点的属性，双击节点编辑文字，按下shift创建关系");
                // 按下shift的同时点击另一个节点，创建关系
                function createLink(fromNode, toNode) {
                    let isLinked = false;
                    for (let edge of _.edgeList) {
                        if (edge.source == fromNode && edge.target == toNode) {
                            isLinked = true;
                            break;
                        }
                    }
                    // 没连过就连上
                    if (!isLinked) {
                        // 压入撤销列表
                        _.pushUndo();

                        let addedEdge;
                        if (!_.edgePrevJson) {
                            addedEdge = CreateBasicEdge(toNode, fromNode);
                        } else {
                            addedEdge = LoadEdgeFromJson(_.edgePrevJson, _.nodeList, false);
                            addedEdge.source = fromNode;
                            addedEdge.target = toNode;
                            addedEdge.uuid = null;
                        }
                        addedEdge.autoSetValue("physics_edge", "linkDistance", Math.sqrt((fromNode.x - nodeObj.x) ** 2 + (fromNode.y - nodeObj.y) ** 2));
                        _.pushEdge(addedEdge);

                        // 绘制
                        _.edges = _.edges
                            .data(_.edgeList, d => d.uuid)
                            .enter()
                            .append("g")
                            .call(d => {
                                _.initEdges(d);
                            })
                            .merge(_.edges);

                        // 初始化组件
                        _.modifyEdgeExterior(addedEdge);
                    }
                }
                if (_.isShiftDown && selectedNodeList.length >= 1) {
                    for (let fromNode of selectedNodeList) {
                        createLink(fromNode, nodeObj);
                        window.setTimeout(() => {
                            _.modifyEdgePhysics();
                        }, Math.random * 300);
                    }
                }
            })
            // 双击转到编辑
            .on("dblclick", function () {
                let nodeObj = d3.select(this).data()[0];
                if (document.querySelector("#text_cop_textarea")) {
                    document.querySelector("#text_cop_textarea").focus();
                }
            })
            // 悬停事件
            .on("mouseenter", function () {
                let nodeObj = d3.select(this).data()[0];
                // 播放音效
                if (nodeObj.hasComponent("audio_node")) {
                    playMusic(
                        nodeObj.autoGetValue("audio_node", "soundType", "pop"),
                        nodeObj.autoGetValue("audio_node", "soundVolume", 1)
                    );
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
            .on("contextmenu", function (e) {
                e.preventDefault();
                if (!_.isZooming) {
                    let nodeObj = d3.select(this).data()[0];
                    _.initMenu_Node(e, nodeObj);
                } else {
                    _.hideMenu();
                }
            })
    }

    /**
     * 生成Drag事件
     */
    initDragEvents(nodes) {
        // 拖动
        let _ = this;
        let moveList = [];
        let clickTime = "";
        function dragstarted(e, d) {
            // 压入撤销列表
            _.pushUndo();

            // 启动物理模拟
            if (!e.active) _.renderProperties.simulation.alphaTarget(0.02).restart();

            d.isMove = true;
            moveList = [];
            clickTime = (new Date()).getTime();

            let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
            // 选中的节点和移动的节点不一样，就取消选中的节点
            if (!selectedNodeList.includes(d)) {
                _.deselectAll();
                selectedNodeList = [d];
            }
            // 多选的节点同步移动
            for (let selectedNode of selectedNodeList) {
                selectedNode.deltaX = selectedNode.x - d.x;
                selectedNode.deltaY = selectedNode.y - d.y;
                moveList.push(selectedNode);
            }
            d.fx = d.x;
            d.fy = d.y;

            // 移动所有在列表中的元素
            for (let moveNode of moveList) {
                moveNode.fx = d.x + moveNode.deltaX;
                moveNode.fy = d.y + moveNode.deltaY;
                moveNode.isMove = true;
            }
        }
        function dragged(e, d) {
            if (!_.alignBlock) {
                d.fx = e.x;
                d.fy = e.y;
                for (let moveNode of moveList) {
                    moveNode.fx = e.x + moveNode.deltaX;
                    moveNode.fy = e.y + moveNode.deltaY;
                }
            } else {
                d.fx = Math.floor(e.x / BLOCK_SIZE) * BLOCK_SIZE;
                d.fy = Math.floor(e.y / BLOCK_SIZE) * BLOCK_SIZE;
                for (let moveNode of moveList) {
                    moveNode.fx = Math.floor(e.x / BLOCK_SIZE) * BLOCK_SIZE + moveNode.deltaX;
                    moveNode.fy = Math.floor(e.y / BLOCK_SIZE) * BLOCK_SIZE + moveNode.deltaY;
                }
            }
        }
        function dragended(e, d) {
            if (!e.active) _.renderProperties.simulation.stop();
            d.isMove = false;
            d.fx = null;
            d.fy = null;
            d.cx = d.x;
            d.cy = d.y;
            for (let moveNode of moveList) {
                moveNode.fx = null;
                moveNode.fy = null;
                moveNode.cx = moveNode.x;
                moveNode.cy = moveNode.y;
                moveNode.isMove = false;
            }
            if (moveList.length == 1) {
                moveList[0].initHtml();
                _.selectElement(moveList[0]);
            } else {
                // 选中被按下的节点
                _.selectElement(d);
                _.calPublicProperties();
            }

            let times = (new Date()).getTime() - clickTime;
            if (times < 100) {
                // 时间过小就不要放到撤销列表里了
                _.undoMirror.shift();
            }
        }
        d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
            (nodes);
    }

    /**
     * 平移缩放
     */
    initZoomEvents() {
        let _ = this;
        let zoomTime = 0;
        _.renderProperties.svg.call(d3.zoom()
            .extent([[0, 0], [this.renderProperties.svg.attr("width"), this.renderProperties.svg.attr("height")]])
            .scaleExtent([0.001, 300])

            // 右键操作
            .filter(e => {
                return e.button == 2 || e.type === "touchstart" || e instanceof WheelEvent
            })
            .on("start", () => {
                _.isZooming = true;
                zoomTime = (new Date()).getTime();
                _.hideMenu();
            })
            .on("end", () => {
                let deltaTime = (new Date()).getTime() - zoomTime;
                if (deltaTime < 150) {
                    _.isZooming = false;
                } else {
                    setTimeout(() => {
                        _.isZooming = false;
                    }, 0);
                }
            })
            .on("zoom", ({ transform }) => {
                _.renderProperties.viewArea.attr("transform", transform);
            }))
            // 取消双击放大事件
            .on("dblclick.zoom", null)
    }

    /**
     * 计算物理模拟
     */
    calPhysics() {
        let _ = this;
        _.renderProperties.simulation.on("tick", () => {
            _.edges.select("path")
                /// 连线位置重新计算
                .attr("d", d => {
                    let path = d3.path();
                    path.moveTo(d.source.x, d.source.y);
                    switch (d.autoGetValue("exterior_edge", "strokeType")) {
                        case "line": {
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "bezierH": {
                            path.bezierCurveTo(d.target.x, d.source.y, d.source.x, d.target.y, d.target.x, d.target.y);
                            break;
                        }
                        case "bezierV": {
                            path.bezierCurveTo(d.source.x, d.target.y, d.target.x, d.source.y, d.target.x, d.target.y);
                            break;
                        }
                        case "straightH1": {
                            path.lineTo(d.source.x + 50, d.source.y);
                            path.lineTo(d.target.x - 50, d.target.y);
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "straightH2": {
                            path.lineTo(d.source.x + 100, d.source.y);
                            path.lineTo(d.target.x - 100, d.target.y);
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "straightV1": {
                            path.lineTo(d.source.x, d.source.y + 50);
                            path.lineTo(d.target.x, d.target.y - 50);
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "straightV2": {
                            path.lineTo(d.source.x, d.source.y + 100);
                            path.lineTo(d.target.x, d.target.y - 100);
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "pointer1": {
                            path.lineTo((d.target.x + d.source.x) / 2, (d.target.y + d.source.y) / 2);
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "pointer2": {
                            let lineLength = Math.sqrt((d.target.x - d.source.x) ** 2 + (d.target.y - d.source.y) ** 2);
                            let clen = 0;
                            while (clen < lineLength) {
                                path.lineTo(
                                    (d.target.x - d.source.x) * (clen / lineLength) + d.source.x,
                                    (d.target.y - d.source.y) * (clen / lineLength) + d.source.y,
                                );
                                clen += 30;
                            }
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "pointer3": {
                            let lineLength = Math.sqrt((d.target.x - d.source.x) ** 2 + (d.target.y - d.source.y) ** 2);
                            let clen = 0;
                            while (clen < lineLength) {
                                path.lineTo(
                                    (d.target.x - d.source.x) * (clen / lineLength) + d.source.x,
                                    (d.target.y - d.source.y) * (clen / lineLength) + d.source.y,
                                );
                                clen += 15;
                            }
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                        case "pointer4": {
                            let lineLength = Math.sqrt((d.target.x - d.source.x) ** 2 + (d.target.y - d.source.y) ** 2);
                            let clen = 0;
                            while (clen < lineLength) {
                                path.lineTo(
                                    (d.target.x - d.source.x) * (clen / lineLength) + d.source.x,
                                    (d.target.y - d.source.y) * (clen / lineLength) + d.source.y,
                                );
                                clen += 7.5;
                            }
                            path.lineTo(d.target.x, d.target.y);
                            break;
                        }
                    }
                    return path.toString();
                });
            // 计算foreignObject的位置
            _.edges.select(".edgeGraphContainer")
                .attr("x", d => (d.target.x + d.source.x) / 2 - d.domWidth / 2)
                .attr("y", d => (d.target.y + d.source.y) / 2 - d.domHeight / 2)
            _.nodes.attr("transform", d => {
                if (!d.isMove)
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
    }

    /**
     * 框选
     */
    initSelectionRect() {
        // 框选
        let _ = this;
        let clickTime = "";
        let startLoc = [];
        let endLoc = [];
        let selectionFlag = false;
        function selectionRect() {
            let rect;
            if (!document.querySelector(".displayArea svg .selectionRect")) {
                rect = d3.select(".displayArea svg").append("rect")
            } else {
                rect = d3.select(".displayArea svg .selectionRect");
            }
            rect
                .attr("class", "selectionRect")
                .attr("width", 0)
                .attr("height", 0)
                .attr("transform", "translate(0,0)")
                .attr("id", "squareSelect");

            // 鼠标按下开始框选
            d3.select(".displayArea svg").on("mousedown", function (e) {
                if (e.button == 0 && e.target == this) {
                    // 更新底部栏
                    _.refreshBottomDom("💡右键移动，左键框选，滚轮缩放");
                    clickTime = (new Date()).getTime();
                    selectionFlag = true;
                    rect.attr("transform", "translate(" + e.layerX + "," + e.layerY + ")");
                    startLoc = [e.layerX, e.layerY];
                    if (!_.isControlDown)
                        _.deselectAll();
                    if (_.isShowRightMenu)
                        _.hideMenu();
                }
            });

            // 鼠标移动更新选区
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

            // 鼠标释放,计算选中的节点
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
                        if (document.querySelector("#check_node").checked) {
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
                        if (document.querySelector("#check_edge").checked) {
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
                        // 计算选中元素的共有属性
                        if (_.selectedElementList.length > 1) {
                            _.calPublicProperties();
                        } else if (_.selectedElementList.length == 1) {
                            _.selectedElementList[0].initHtml();
                        }
                        if (_.selectedElementList.length > 0) {
                            // 更新底部栏
                            _.refreshBottomDom(`💡已选择${_.selectedElementList.length}个元素，ctrl+C复制选中的元素，或者直接按住移动`);
                        }
                    }
                    let times = (new Date()).getTime() - clickTime;
                    if (times < 100) {
                        _.deselectAll();
                    }
                }
                _.hideMenu();
            })
        }
        selectionRect();
    }

    /**
     * 计算元素的公有属性并更新DOM
     */
    calPublicProperties() {
        let _ = this;
        let publicComponentList = [];
        for (let componentKey in _.selectedElementList[0].componentMap) {
            publicComponentList.push(componentKey);
        }
        for (let i = 1; i < _.selectedElementList.length; i++) {
            let element = _.selectedElementList[i];
            for (let j = 0; j < publicComponentList.length; j++) {
                let publicComponentKey = publicComponentList[j];
                let hasKey = false;
                for (let componentKey in element.componentMap) {
                    if (componentKey == publicComponentKey) {
                        hasKey = true;
                        break;
                    }
                }
                if (!hasKey) {
                    publicComponentList.splice(j, 1);
                    j--;
                }
            }
        }
        // 显示公有组件UI
        let domCompContianer = document.createElement("div");
        domCompContianer.classList = "compContainer";
        for (let key of publicComponentList) {
            domCompContianer.appendChild(_.selectedElementList[0].componentMap[key].initHtml());
        }
        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
        document.querySelector(".panArea .listPan").innerHTML = "";
        document.querySelector(".panArea .listPan").appendChild(domCompContianer);
    }

    /**
     * 复制元素
     */
    copyElements() {
        this.copiedNodeJsonList = [];
        this.copiedEdgeJsonList = [];
        for (let i = 0; i < this.selectedElementList.length; i++) {
            let currentElement = this.selectedElementList[i];
            if (currentElement.type == "node") {
                this.copiedNodeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
            } else if (currentElement.type == "edge") {
                this.copiedEdgeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
            }
        }
        // 将元素复制到剪贴板，需要HTTPS
        let storeText = JSON.stringify({
            from: "vgd",
            content: {
                nodeList: this.copiedNodeJsonList,
                edgeList: this.copiedEdgeJsonList
            }
        });
        // let clipboardObj = navigator.clipboard;
        // clipboardObj.writeText(storeText);
        // 将元素复制到sessionStorage
        window.localStorage.setItem("gdClipBoard", storeText);

        // 更新底部栏
        this.refreshBottomDom(`🏷️已复制${this.copiedNodeJsonList.length}个节点，${this.copiedEdgeJsonList.length}个关系，按下ctrl+V在鼠标位置粘贴`);
    }

    /**
     * 剪切元素
     */
    cutElements() {
        this.copiedNodeJsonList = [];
        this.copiedEdgeJsonList = [];
        for (let i = 0; i < this.selectedElementList.length; i++) {
            let currentElement = this.selectedElementList[i];
            if (currentElement.type == "node") {
                this.copiedNodeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
            } else if (currentElement.type == "edge") {
                this.copiedEdgeJsonList.push(JSON.stringify(currentElement.toJsonObj()));
            }
        }
        // 将元素复制到剪贴板，需要HTTPS
        let storeText = JSON.stringify({
            from: "vgd",
            content: {
                nodeList: this.copiedNodeJsonList,
                edgeList: this.copiedEdgeJsonList
            }
        });
        // let clipboardObj = navigator.clipboard;
        // clipboardObj.writeText(storeText);
        // 将元素复制到sessionStorage
        window.localStorage.setItem("gdClipBoard", storeText);

        // 删除原来的元素
        for (let i = 0; i < this.selectedElementList.length; i++) {
            let currentElement = this.selectedElementList[i];
            this.deleteElement(currentElement);
        }

        // 更新底部栏
        this.refreshBottomDom(`🏷️已剪切${this.copiedNodeJsonList.length}个节点，${this.copiedEdgeJsonList.length}个关系，按下ctrl+V在鼠标位置粘贴`);
    }

    /**
     * 粘贴元素
     */
    pasteElements() {
        // 压入撤销列表
        this.pushUndo();

        // 如果剪贴板内的内容合法，就粘贴剪贴板的内容
        // try {
        //     let clipboardObj = navigator.clipboard;
        //     let pasteData = await clipboardObj.readText();
        //     let pasteDataDecoded = JSON.parse(pasteData);
        //     if (pasteDataDecoded.from != "vgd") throw new Error("不合法的剪贴板");
        //     if (!pasteDataDecoded.content.nodeList) throw new Error("不合法的剪贴板");
        //     if (!pasteDataDecoded.content.edgeList) throw new Error("不合法的剪贴板");
        //     this.copiedNodeJsonList = pasteDataDecoded.content.nodeList;
        //     this.copiedEdgeJsonList = pasteDataDecoded.content.edgeList;
        // } catch (e) {
        //     console.log(e.message);
        //     console.log("剪贴板出错，切换到本地粘贴");
        // }

        // 从sessionStorage粘贴
        try {
            let pasteData = window.localStorage.getItem("gdClipBoard");
            let pasteDataDecoded = JSON.parse(pasteData);
            if (pasteDataDecoded.from != "vgd") throw new Error("不合法的剪贴板");
            if (!pasteDataDecoded.content.nodeList) throw new Error("不合法的剪贴板");
            if (!pasteDataDecoded.content.edgeList) throw new Error("不合法的剪贴板");
            this.copiedNodeJsonList = pasteDataDecoded.content.nodeList;
            this.copiedEdgeJsonList = pasteDataDecoded.content.edgeList;
        } catch {
            console.log("session读取出错，切换到本地粘贴")
        }

        // 记录新旧键值对
        let oldNewUuid = new Map();

        // 记录所有粘贴的元素
        let pastedNodeObjs = [];
        let pastedEdgeObjs = [];

        // 粘贴node
        for (let i = 0; i < this.copiedNodeJsonList.length; i++) {
            let jsonString = this.copiedNodeJsonList[i];
            let nodeStore = JSON.parse(jsonString);
            let finalNodeStore = JSON.parse(this.copiedNodeJsonList[this.copiedNodeJsonList.length - 1]);
            let oldUuid = nodeStore.uuid;
            nodeStore.uuid = null;
            // 计算鼠标在svg中的相对位置
            let transform = d3.zoomTransform(this.renderProperties.viewArea.node());
            let pt = transform.invert([this.mouseX, this.mouseY]);
            nodeStore.x = nodeStore.x - finalNodeStore.x + pt[0];
            nodeStore.y = nodeStore.y - finalNodeStore.y + pt[1];
            nodeStore.cx = nodeStore.x + Math.random() / 100;
            nodeStore.cy = nodeStore.y + Math.random() / 100;
            let loadedNode = LoadNodeFromJson(nodeStore);
            this.pushNode(loadedNode);
            pastedNodeObjs.push(loadedNode);

            oldNewUuid.set(oldUuid, loadedNode.uuid);
        }
        this.nodes = this.nodes.data(this.nodeList, d => d.uuid)
            .enter()
            .append("g")
            .merge(this.nodes);
        this.initNodes(this.nodes);
        for (let pastedNodeObj of pastedNodeObjs) {
            this.modifyNodeExterior(pastedNodeObj);
        }

        // 粘贴edge
        this.copiedEdgeJsonList.forEach(jsonString => {
            let edgeStore = JSON.parse(jsonString);
            if (oldNewUuid.has(edgeStore.source) && oldNewUuid.has(edgeStore.target)) {
                edgeStore.source = oldNewUuid.get(edgeStore.source);
                edgeStore.target = oldNewUuid.get(edgeStore.target);
                edgeStore.uuid = null;
                let loadedEdge = LoadEdgeFromJson(edgeStore, this.nodeList);
                this.pushEdge(loadedEdge);
                pastedEdgeObjs.push(loadedEdge);
            }
        });
        this.edges = this.edges
            .data(this.edgeList, d => d.uuid)
            .enter()
            .append("g")
            .merge(this.edges);
        this.initEdges(this.edges);
        for (let pastedEdgeObj of pastedEdgeObjs) {
            this.modifyEdgeExterior(pastedEdgeObj);
        }

        this.modifyNodePhysics();
        this.modifyEdgePhysics();

        // 更新底部栏
        this.refreshBottomDom(`🏷️已粘贴${this.copiedNodeJsonList.length}个节点，${this.copiedEdgeJsonList.length}个关系`);

        // 绑定节点的drag事件
        this.initDragEvents(this.nodes);

        window.setTimeout(() => {
            this.renderProperties.simulation.alphaTarget(0.02).restart();
            window.setTimeout(() => {
                this.renderProperties.simulation.stop();
            }, 20);
        }, 300);

        // 返回复制的元素
        return {
            nodes: pastedNodeObjs,
            edges: pastedEdgeObjs
        }
    }

    /**
     * 向图谱中添加节点
     */
    addNode(e, type) {
        let _ = this;

        // 添加节点
        let addedNode;
        switch (type) {
            case "basic":
                addedNode = CreateBasicNode();
                break;
            case "text":
                addedNode = CreateTextNode();
                break;
            case "link":
                addedNode = CreateLinkNode();
                break;
            case "img":
                addedNode = CreateImgNode();
                break;
            case "video":
                addedNode = CreateVideoNode();
                break;
            case "code":
                addedNode = CreateCodeNode();
                break;
            case "md":
                addedNode = CreateMdNode();
                break;
            case "latex":
                addedNode = CreateLatexNode();
                break;
            default:
                addedNode = CreateBasicNode();
        }
        // 计算鼠标在svg中的相对位置
        let transform = d3.zoomTransform(_.renderProperties.viewArea.node());
        let pt = transform.invert([e.x, e.y]);
        addedNode.x = pt[0];
        addedNode.y = pt[1];
        _.pushNode(addedNode);

        _.nodes = _.nodes
            .data(_.nodeList, d => d.uuid)
            .enter()
            .append("g")
            .merge(_.nodes);
        _.initNodes(_.nodes);

        // 初始化组件
        _.modifyNodeExterior(addedNode);
        _.modifyNodePhysics();

        _.deselectAll();
        // 选中新添加的节点
        _.selectElement(addedNode);

        _.initDragEvents(_.nodes);

        // 更新属性栏
        addedNode.initHtml();
        return addedNode;
    }

    /**
     * 从节点字符串添加节点
     */
    addNodeFromString(nodeString, addOffset = true) {
        nodeString = JSON.parse(nodeString);
        // 记录所有粘贴的元素
        let pastedNodeObjs = [];
        // 粘贴node
        for (let i = 0; i < nodeString.length; i++) {
            let nodeStore = nodeString[i];
            nodeStore.uuid = null;
            // 计算鼠标在svg中的相对位置
            let transform = d3.zoomTransform(this.renderProperties.viewArea.node());
            let pt = transform.invert([addOffset ? this.mouseX + 350 : this.mouseX, this.mouseY]);
            nodeStore.x = pt[0] + Math.random() * 10;
            nodeStore.y = pt[1] + Math.random() * 10;
            nodeStore.cx = nodeStore.x + Math.random() * 10;
            nodeStore.cy = nodeStore.y + Math.random() * 10;
            let loadedNode = LoadNodeFromJson(nodeStore);
            this.pushNode(loadedNode);
            pastedNodeObjs.push(loadedNode);
        }
        this.nodes = this.nodes.data(this.nodeList, d => d.uuid)
            .enter()
            .append("g")
            .merge(this.nodes);
        this.initNodes(this.nodes);
        for (let pastedNodeObj of pastedNodeObjs) {
            this.modifyNodeExterior(pastedNodeObj);
        }

        this.modifyNodePhysics();

        // 绑定节点的drag事件
        this.initDragEvents(this.nodes);

        window.setTimeout(() => {
            this.renderProperties.simulation.alphaTarget(0.02).restart();
            window.setTimeout(() => {
                this.renderProperties.simulation.stop();
            }, 20);
        }, 300);
    }

    /**
     * 向图谱中添加新关系
     */
    addEdge(source, target) {
        let _ = this;

        let addedEdge = CreateBasicEdge(source, target);
        _.pushEdge(addedEdge);

        _.edges = _.edges
            .data(_.edgeList, d => d.uuid)
            .enter()
            .append("g")
            .call(d => {
                _.initEdges(d);
            })
            .merge(_.edges)

        // 初始化组件
        _.modifyEdgeExterior(addedEdge);
        _.modifyEdgePhysics();
        addedEdge.initHtml();

        return addedEdge;
    }

    /**
     * 从图谱中删除节点
     */
    deleteElement(elementObj) {
        if (elementObj.type == "node") {
            // 移除相关关系
            let removeEdgeList = this.findNodeEdges(elementObj);
            for (let i = 0; i < removeEdgeList.length; i++) {
                let currentRemoveEdge = removeEdgeList[i];
                if (this.edgeList.indexOf(currentRemoveEdge) != -1) {
                    this.edgeList.splice(this.edgeList.indexOf(currentRemoveEdge), 1);
                    d3.select(`#${currentRemoveEdge.uuid}`).remove();
                    this.edges = this.edges.filter(edge => { return edge.uuid != currentRemoveEdge.uuid });
                }
            }
            // 移除节点
            if (this.nodeList.indexOf(elementObj) != -1) {
                this.nodeList.splice(this.nodeList.indexOf(elementObj), 1);
                d3.select(`#${elementObj.uuid}`).remove();
                this.nodes = this.nodes.filter(node => { return node.uuid != elementObj.uuid });
            }
        } else if (elementObj.type == "edge") {
            // 移除关系
            if (this.edgeList.indexOf(elementObj) != -1) {
                this.edgeList.splice(this.edgeList.indexOf(elementObj), 1);
                d3.select(`#${elementObj.uuid}`).remove();
                this.edges = this.edges.filter(edge => { return edge.uuid != elementObj.uuid });
            }
        }
    }

    /**
     * 修改单个节点
     */
    modifyNodeExterior(nodeObj) {
        // 图片转为base64
        function convertImgToBase64(url, callback) {
            var canvas = document.createElement("CANVAS"),
                ctx = canvas.getContext("2d"),
                img = new Image;
            img.crossOrigin = "Anonymous";
            img.src = url;
            img.onload = function () {
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL("image/png");
                callback(this, dataURL);
                canvas = null;
            };
        }

        const findedNode = this.renderProperties.viewArea.select(`#${nodeObj.uuid}`);

        // 先删除原来绘制的形状
        findedNode.selectAll(".nodeGraph").remove();
        findedNode.selectAll(".nodeGraphContainer").remove();

        // 在这里指定组件的绘制顺序
        let addedNodeGraph = null;
        let addedNodeCircle = null;
        let addedNodeRect = null;

        let domAddedNodeText = null;
        let domAddedNodeCode = null;
        let domAddedNodeLink = null;
        let domAddedNodeImg = null;
        let domAddedNodeFile = null;
        let domAddedNodeVideo = null;
        let domAddedNodeIframe = null;
        let domAddedNodeMd = null;
        let domAddedNodeFunc1 = null;
        let domAddedNodeLatex = null;
        let domAddedNodeQrCode = null;

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
        if (nodeObj.hasComponent("code_node"))
            domAddedNodeCode = domAddedSubComponentContainer.append("xhtml:pre");
        if (nodeObj.hasComponent("link_node"))
            domAddedNodeLink = domAddedSubComponentContainer.append("xhtml:a");
        if (nodeObj.hasComponent("img_node"))
            domAddedNodeImg = domAddedSubComponentContainer.append("xhtml:img");
        if (nodeObj.hasComponent("file_node"))
            domAddedNodeFile = domAddedSubComponentContainer.append("xhtml:a");
        if (nodeObj.hasComponent("video_node"))
            domAddedNodeVideo = domAddedSubComponentContainer.append("xhtml:video");
        if (nodeObj.hasComponent("iframe_node"))
            domAddedNodeIframe = domAddedSubComponentContainer.append("xhtml:iframe");
        if (nodeObj.hasComponent("md_node"))
            domAddedNodeMd = domAddedSubComponentContainer.append("xhtml:div");
        if (nodeObj.hasComponent("func1_node"))
            domAddedNodeFunc1 = domAddedSubComponentContainer.append("xhtml:iframe");
        if (nodeObj.hasComponent("latex_node"))
            domAddedNodeLatex = domAddedSubComponentContainer.append("xhtml:div");
        if (nodeObj.hasComponent("qrcode_node"))
            domAddedNodeQrCode = domAddedSubComponentContainer.append("xhtml:img");

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
                    rawText = rawText.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;")
                        .replace(/ /g, "&nbsp;");
                    let retText = rawText.replace(/\n/g, "<div></div>");
                    return retText;
                })
                .style("color", d => d.autoGetValue("text_node", "textColor", "#ffffff"))
                .style("font-family", d => d.autoGetValue("text_node", "textFont", "'Courier New', Courier, monospace"))
                .style("font-size", d => d.autoGetValue("text_node", `textSize`, "2px", value => {
                    if (value < 12) {
                        return `12px`;
                    } else {
                        return `${value}px`;
                    }
                }))
                .style("letter-spacing", d => d.autoGetValue("text_node", `textSpacing`, "0", value => `${value}px`))
                .style("font-weight", d => d.autoGetValue("text_node", "textWeight", 100, value => value * 100))

        if (domAddedNodeCode) {
            domAddedNodeCode
                .attr("class", "nodeCode")
                .style("width", "max-content")
                .style("height", "max-content")
                .style("text-anchor", "middle")
                .style("dominant-baseline", "middle")
                .style("padding", "10px")
                .html(d => `<code>${d.autoGetValue("code_node", "content", "", value => value.replace(/</g, "&lt;").replace(/>/g, "&gt;"))}</code>`)
            hljs.highlightAll();
        }

        if (domAddedNodeLink)
            domAddedNodeLink
                .attr("class", "nodeLink nodeBlock")
                .html("🔗")
                .style("display", "block")
                .style("margin-left", 0)
                .style("padding", "1px")
                .style("color", "rgb(200,200,200)")
                .style("font-size", "10px")
                .style("height", "max-content")
                .style("width", "max-content")
                .style("border-radius", "2px")
                .style("background-color", "rgb(50,50,50)")
                .style("cursor", "pointer")
                .style("text-decoration", "none")
                .style("margin-top", "5px")
                .attr("href", d => d.autoGetValue("link_node", "url"))
                .attr("target", "_blank")

        if (domAddedNodeImg)
            domAddedNodeImg
                .attr("class", "nodeImg")
                // .attr("src", d => d.autoGetValue("img_node", "path", "#", value => IMG_STORE_PATH + value))
                .style("display", "block")
                .attr("alt", "图片加载中")
                .style("width", d => d.autoGetValue("img_node", "width", "200px"))
                .attr("class", "nodeImg")
                .attr("src", loadingImg)
                .attr("dataSource", nodeObj.autoGetValue("img_node", "path", "#", value => IMG_STORE_PATH + value))
                .on("load", function () {
                    calSize();
                })
        let imgSrc = nodeObj.autoGetValue("img_node", "path", "#", value => IMG_STORE_PATH + value);
        convertImgToBase64(imgSrc, function (_, blob) {
            calSize();
            domAddedNodeImg.attr("src", blob);
        })

        if (domAddedNodeFile)
            domAddedNodeFile
                .attr("class", "nodeFile nodeBlock")
                .html("📑")
                .style("display", "block")
                .style("margin-left", 0)
                .style("padding", "1px")
                .style("color", "rgb(200,200,200)")
                .style("font-size", "10px")
                .style("height", "max-content")
                .style("width", "max-content")
                .style("border-radius", "2px")
                .style("background-color", "rgb(50,50,50)")
                .style("cursor", "pointer")
                .style("text-decoration", "none")
                .style("margin-top", "5px")
                .attr("download", d => d.autoGetValue("file_node", "path", "#", value => FILE_STORE_PATH + value))
                .attr("href", d => d.autoGetValue("file_node", "path", "#", value => FILE_STORE_PATH + value))
                .attr("target", "_blank")

        if (domAddedNodeVideo)
            domAddedNodeVideo
                .attr("class", "nodeVideo")
                .attr("controls", true)
                .attr("src", d => d.autoGetValue("video_node", "path", "#", value => VIDEO_STORE_PATH + value))
                .style("display", "block")
                .style("width", d => d.autoGetValue("video_node", "width", "200px"))
                .on("load", function () {
                    calSize();
                })

        if (domAddedNodeIframe)
            domAddedNodeIframe
                .attr("class", "nodeIframe")
                .attr("width", d => d.autoGetValue("iframe_node", "width", 200))
                .attr("height", d => d.autoGetValue("iframe_node", "height", 200))
                .attr("src", d => d.autoGetValue("iframe_node", "src", "#"))
                .style("margin", "20px")

        if (domAddedNodeMd)
            domAddedNodeMd
                .attr("class", "nodeMd")
                .style("color", d => d.autoGetValue("md_node", "textColor", "#ffffff"))
                .html(d => marked(d.autoGetValue("md_node", "content", "")));

        if (domAddedNodeFunc1)
            domAddedNodeFunc1
                .attr("class", "nodeIframe nodeFunc1")
                .attr("width", 300)
                .attr("height", 400)
                .attr("src", d => {
                    return `${FUNC1_COMP}?fn=${d.autoGetValue("func1_node", "func", "x")}`
                })

        if (domAddedNodeLatex)
            domAddedNodeLatex
                .attr("class", "nodeLatex")
                .style("color", d => d.autoGetValue("latex_node", "textColor", "#ffffff"))
                .html(d => katex.renderToString(d.autoGetValue("latex_node", "latex", ""), { throwOnError: false }));

        if (domAddedNodeQrCode)
            domAddedNodeQrCode
                .attr("class", "nodeQrCode")
                .on("load", function () {
                    calSize();
                })
                .attr("temp", d => {
                    QRCode.toDataURL(d.autoGetValue("qrcode_node", "url", "#"))
                        .then(url => {
                            domAddedNodeQrCode.attr("src", url);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })

        domAddedSubComponentContainer
            .style("display", "flex")
            .style("width", "max-content")
            .style("height", "max-content")
            .style("flex-direction", "column")
            .style("margin", 0)
            .style("padding", 0)
            .style("scale", 0)
            .style("opacity", 0)
            .transition()
            .ease(d3.easeBounceInOut)
            .duration(d => d.autoGetValue("exterior_node", "aniDuration", 0, value => value * 1000))
            .delay(d => Math.random() * d.autoGetValue("exterior_node", "aniDelayRand", 0, value => value * 1000))
            .style("scale", 1)
            .style("opacity", 1)

        domAddedSubComponentContainer.selectAll("*")
            .style("margin", 0)
            .style("padding", 0)

        addedSubComponentForeign
            .style("rotate", d => d.autoGetValue("exterior_node", "rotate", 0, value => `${value}deg`))
            .style("scale", d => d.autoGetValue("exterior_node", "scale", 1))

        function calSize() {
            addedSubComponentForeign
                .attr("width", function () {
                    let containerDom = d3.select(this).select(".nodeGraphDomContainer");
                    return containerDom.node().offsetWidth + 1;
                })
                .attr("height", function () {
                    let containerDom = d3.select(this).select(".nodeGraphDomContainer");
                    return containerDom.node().offsetHeight + 1;
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
                            height = Math.abs(addedSubComponentForeign.node().getBBox().height) + 8;
                        }
                        return height;
                    })
                    .attr("x", d => -d3.select(`#${d.uuid} .nodeRect`).attr("width") / 2)
                    .attr("y", d => -d3.select(`#${d.uuid} .nodeRect`).attr("height") / 2)
            }
        }
        calSize();

        addedNodeGraph
            .style("rotate", d => d.autoGetValue("exterior_node", "rotate", 0, value => `${value}deg`))
            .style("scale", 0)
            .style("opacity", 0)
            .style("fill", d => d.autoGetValue("exterior_node", "bgColor", "#000000"))
            .style("stroke", d => d.autoGetValue("exterior_node", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_node", "strokeWidth", "1px", value => `${value}px`))
            .style("stroke-dasharray", d => d.autoGetValue("exterior_node", "strokeStyle", "0"))
            .attr("rx", d => d.autoGetValue("exterior_node", "round", 0))
            // 开机动画
            .transition()
            .ease(d3.easeBounceInOut)
            .duration(d => d.autoGetValue("exterior_node", "aniDuration", 0, value => value * 1000))
            .delay(d => Math.random() * d.autoGetValue("exterior_node", "aniDelayRand", 0, value => value * 1000))
            .style("scale", d => d.autoGetValue("exterior_node", "scale", 1))
            .style("opacity", d => d.autoGetValue("exterior_node", "opacity", 1))


        // 绑定CSS样式
        if (nodeObj.hasComponent("css_node")) {
            domAddedSubComponentContainer.node().style.cssText += nodeObj.autoGetValue("css_node", "content", "");
            calSize();
        }
    }

    /**
     * 修改节点的物理表现
     */
    modifyNodePhysics() {
        this.renderProperties.simulation.nodes(this.nodeList)
        this.renderProperties.forces.collideForce
            .radius(d => {
                let radius = d.autoGetValue("physics_node", "collisionRadius", 20);
                if (!d.autoGetValue("physics_node", "fixPosition", false)) {
                    if (d.autoGetValue("physics_node", "collisionRadiusAuto", false)) {
                        if (d.autoGetValue("exterior_node", "shape") == "circle")
                            radius = d3.select(`#${d.uuid} .nodeGraph`).attr("r") * 1.2;
                        else if (d.autoGetValue("exterior_node", "shape") == "rect")
                            radius = Math.sqrt((d3.select(`#${d.uuid} .nodeGraphContainer`).node().getBBox().width / 2) ** 2 + (d3.select(`#${d.uuid} .nodeGraphContainer`).node().getBBox().height / 2) ** 2) * 1.2;
                    }
                } else {
                    radius = 0;
                }
                return radius;
            });
        this.renderProperties.forces.chargeForce = d3.forceManyBody()
            .strength(d => d.autoGetValue("physics_node", "manyBodyForceStrength", -80, value => -value))
            .distanceMax(d => d.autoGetValue("physics_node", "manyBodyForceRangeMin", 10))
            .distanceMin(d => d.autoGetValue("physics_node", "manyBodyForceRangeMax", 12))
        this.renderProperties.simulation.alphaTarget(0.0).restart();
    }

    /**
     * 修改单个关系
     */
    modifyEdgeExterior(edgeObj) {
        let findedEdgeGroup = this.renderProperties.viewArea.select(`#${edgeObj.uuid}`);
        let findedEdge = findedEdgeGroup.select("path");

        findedEdge
            .attr("stroke", d => d.autoGetValue("exterior_edge", "strokeColor", "#ffffff"))
            .style("stroke-width", d => d.autoGetValue("exterior_edge", "strokeWidth", "1px", value => `${value}px`))
            .style("stroke-dasharray", d => d.autoGetValue("exterior_edge", "strokeStyle", "0"))
            .attr("fill", "none")
            .style("opacity", 0)
            .transition()
            .ease(d3.easeBounceInOut)
            .duration(d => d.autoGetValue("exterior_edge", "aniDuration", 0, value => value * 1000))
            .delay(d => Math.random() * d.autoGetValue("exterior_edge", "aniDelayRand", 0, value => value * 1000))
            .style("opacity", 1)

        // 先删除原来绘制的形状
        findedEdgeGroup.selectAll(".edgeGraphContainer").remove();

        // 在这里指定组件的绘制顺序
        let domAddedNodeText = null;

        // 容器
        let addedSubComponentForeign = null;
        let domAddedSubComponentContainer = null;

        addedSubComponentForeign = findedEdgeGroup.append("foreignObject").attr("class", "edgeGraphContainer");
        domAddedSubComponentContainer = addedSubComponentForeign.append("xhtml:body").attr("class", "edgeGraphDomContainer");

        if (edgeObj.hasComponent("text_edge"))
            domAddedNodeText = domAddedSubComponentContainer.append("xhtml:div");

        // 在这里绑定组件的属性
        if (domAddedNodeText)
            domAddedNodeText
                .attr("class", "nodeText")
                .style("width", "max-content")
                .style("height", "max-content")
                .style("text-anchor", "middle")
                .style("pointer-events", "null")
                .style("dominant-baseline", "middle")
                .html(d => {
                    let rawText = d.autoGetValue("text_edge", "showText", "");
                    rawText = rawText.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;");
                    let retText = rawText.replace(/\n/g, "<div></div>");
                    return retText;
                })
                .style("color", d => d.autoGetValue("text_edge", "textColor", "#ffffff"))
                .style("font-family", d => d.autoGetValue("text_edge", "textFont", "'Courier New', Courier, monospace"))
                .style("font-size", d => d.autoGetValue("text_edge", `textSize`, "2px", value => {
                    if (value < 12) {
                        return `12px`;
                    } else {
                        return `${value}px`;
                    }
                }))
                .style("letter-spacing", d => d.autoGetValue("text_edge", `textSpacing`, "0", value => `${value}px`))
                .style("font-weight", d => d.autoGetValue("text_edge", "textWeight", 100, value => value * 100))
                .style("opacity", d => d.autoGetValue("text_edge", "opacity", 1))

        domAddedSubComponentContainer
            .style("display", "flex")
            .style("width", "max-content")
            .style("height", "max-content")
            .style("flex-direction", "column")
            .style("margin", 0)
            .style("padding", 0)
            // 偏移
            .style("padding-left", d => d.autoGetValue("text_edge", "offsetX", 0))
            .style("padding-bottom", d => d.autoGetValue("text_edge", "offsetY", 0))
            .style("scale", 0)
            .style("opacity", 0)
            .transition()
            .ease(d3.easeBounceInOut)
            .duration(d => d.autoGetValue("exterior_edge", "aniDuration", 0, value => value * 1000))
            .delay(d => Math.random() * d.autoGetValue("exterior_edge", "aniDelayRand", 0, value => value * 1000))
            .style("scale", 1)
            .style("opacity", 1)


        domAddedSubComponentContainer.selectAll("*")
            .style("margin", 0)
            .style("padding", 0)

        function calSize() {
            addedSubComponentForeign
                .attr("width", function () {
                    let containerDom = domAddedSubComponentContainer;
                    let width = containerDom.node().offsetWidth + 1;
                    edgeObj.domWidth = width;
                    return width;
                })
                .attr("height", function () {
                    let containerDom = domAddedSubComponentContainer;
                    let height = containerDom.node().offsetHeight + 1;
                    edgeObj.domHeight = height;
                    return height;
                })
        }

        switch (edgeObj.autoGetValue("exterior_edge", "strokeType")) {
            case "pointer1": { }
            case "pointer2": { }
            case "pointer3": { }
            case "pointer4": {
                findedEdge.style("marker-mid", "url(#marker_triangle)");
                setMarkerColors([findedEdge.node()], document.querySelector("#marker_triangle"));
                break;
            }
        }

        this.renderProperties.simulation.restart();
        // 更新元素
        this.refreshBottomDom();

        // 更新edgePrev
        if (this.selectedElementList.length == 1) {
            this.edgePrevJson = edgeObj.toJsonObj();
        }
        calSize();
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
        if (!this.selectedElementList.includes(elementObj))
            this.selectedElementList.push(elementObj);
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
        document.querySelector(".panArea .listPan").innerHTML = "";
        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
    }

    /**
     * 查找和node关联的edge
     */
    findNodeEdges(nodeObj) {
        let relatedEdgeList = [];
        for (let i = 0; i < this.edgeList.length; i++) {
            let currentEdge = this.edgeList[i];
            if (currentEdge.source == nodeObj || currentEdge.target == nodeObj)
                relatedEdgeList.push(currentEdge);
        }
        return relatedEdgeList;
    }

    /**
     * 下载为图片
     */
    genSvg(toSrc = true) {
        let _ = this;
        const svg = document.querySelector('svg');
        // 将blob转换为src
        if (toSrc) {
            let index = 0;
            _.blobTempList = [];
            document.querySelectorAll(".nodeImg").forEach(ele => {
                _.blobTempList.push(ele.getAttribute("src"));
                ele.setAttribute("src", ele.getAttribute("datasource"));
                index++;
            });
        }
        let source = new XMLSerializer().serializeToString(svg); //将整个SVG document 对象序列化为一个 XML 字符串
        let blob = new Blob([source], { type: "text/xml" }); // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成
        // src再转为blob
        if (toSrc) {
            let index = 0;
            document.querySelectorAll(".nodeImg").forEach(ele => {
                ele.setAttribute("datasource", ele.getAttribute("src"));
                ele.setAttribute("src", _.blobTempList[index]);
                index++;
            });
        }
        return blob;
    }
    exportSvg() {
        let _ = this;
        onDownload(this.genSvg(false), 'test.svg'); // 下载 
        function onDownload(data, name) {
            const url = window.URL.createObjectURL(data); //创建一个url
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
    exportImg(scale = 12, type = "png") {
        let svgNode = document.querySelector(".displayArea svg");
        let svgData = new XMLSerializer().serializeToString(svgNode)
        let svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)))
        let svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgDataBase64}`
        let img = new Image();
        img.src = svgDataUrl;
        img.onload = function () {
            let width = svgNode.getAttribute("width") * scale;
            let height = svgNode.getAttribute("height") * scale;
            let canvas = document.createElement("canvas");
            canvas.setAttribute("width", width)
            canvas.setAttribute("height", height)

            let context = canvas.getContext("2d")
            context.drawImage(img, 0, 0, width, height)

            let aLink = document.createElement("a");
            aLink.style.display = "none";
            aLink.href = canvas.toDataURL(`image/${type}`, 1.0);
            aLink.download = "v-gd" + ("-" + new Date().getTime()) + "." + type;
            document.body.appendChild(aLink);
            aLink.click();
            document.body.removeChild(aLink);
        }
    }
    exportPng(scale = 12) {
        this.exportImg(scale, "png");
    }
    exportJpg(scale = 12) {
        this.exportImg(scale, "jpg");
    }

    /**
     * 提取节点的关键词TAG
     */
    async extractNode(nodeObj, afterFn = () => { }) {
        let isEmptyNode = true;
        if (nodeObj.hasComponent("text_node")) {
            let text = nodeObj.autoGetValue("text_node", "showText");
            let data = await extractText(text, "text");
            // 修改TAG组件
            for (let i = 0; i < data.msg.length; i++) {
                nodeObj.addTag(data.msg[i].keyword);
            }
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("code_node")) {
            nodeObj.addTag("代码块");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("md_node")) {
            nodeObj.addTag("Markdown");
            let text = nodeObj.autoGetValue("md_node", "content");
            let data = await extractText(text, "markdown");
            // 修改TAG组件
            for (let i = 0; i < data.msg.length; i++) {
                nodeObj.addTag(data.msg[i].keyword);
            }
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("link_node")) {
            nodeObj.addTag("链接");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("img_node")) {
            nodeObj.addTag("图片");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("file_node")) {
            nodeObj.addTag("文件");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("video_node")) {
            nodeObj.addTag("视频");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("iframe_node")) {
            nodeObj.addTag("页面");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("func1_node")) {
            nodeObj.addTag("函数");
            isEmptyNode = false;
        }
        if (nodeObj.hasComponent("latex_node")) {
            nodeObj.addTag("公式");
            isEmptyNode = false;
        }
        if (isEmptyNode) {
            nodeObj.addTag("装饰节点");
        }
        afterFn(nodeObj);
    }

    /**
     * 提取所有节点TAG
     */
    async extractAllNode() {
        for (let cNodeObj of this.nodeList) {
            this.extractNode(cNodeObj);
        }
        window.setTimeout(() => {
            showMessage(`关键词提取完成,共${this.nodeList.length}个节点`);
        }, 700);
    }

    /**
     * 在空白处点击的菜单
     */
    initMenu_Svg(e) {
        let _ = this;
        let menu = [
            {
                name: "添加空白节点",
                func: function () {
                    _.addNode(e, "basic");
                }
            },
            {
                name: "添加文本节点",
                func: function () {
                    _.addNode(e, "text");
                }
            },
            {
                name: "添加链接节点",
                func: function () {
                    _.addNode(e, "link");
                }
            },
            {
                name: "添加图片节点",
                func: function () {
                    _.addNode(e, "img");
                }
            },
            {
                name: "添加视频节点",
                func: function () {
                    _.addNode(e, "video");
                }
            },
            {
                name: "添加代码节点",
                func: function () {
                    _.addNode(e, "code");
                }
            },
            {
                name: "添加MD节点",
                func: function () {
                    _.addNode(e, "md");
                }
            },
            {
                name: "添加公式节点",
                func: function () {
                    _.addNode(e, "latex");
                }
            },
            {
                divider: true
            },
            {
                name: "提取所有节点关键词",
                func: async function () {
                    _.extractAllNode();
                }
            }
        ]
        this.initMenu(e, menu);
    }

    /**
     * 在节点上右键的菜单
     */
    initMenu_Node(e, nodeObj) {
        let _ = this;
        let menu = [
            {
                name: "移到顶层",
                func: function () {
                    _.pushUndo();
                    let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                    if (selectedNodeList.length != 0) {
                        for (let selectedNodeObj of selectedNodeList) {
                            let node = document.querySelector(`#${selectedNodeObj.uuid}`);
                            document.querySelector("#nodeLayer").appendChild(node);
                            _.nodeList.splice(_.nodeList.indexOf(selectedNodeObj), 1);
                            _.nodeList.push(selectedNodeObj);
                        }
                    } else {
                        let node = document.querySelector(`#${nodeObj.uuid}`);
                        document.querySelector("#nodeLayer").appendChild(node);
                        _.nodeList.splice(_.nodeList.indexOf(nodeObj), 1);
                        _.nodeList.push(nodeObj);
                    }
                }
            },
            {
                name: "移到底层",
                func: function () {
                    _.pushUndo();
                    let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                    if (selectedNodeList.length != 0) {
                        for (let selectedNodeObj of selectedNodeList) {
                            let node = document.querySelector(`#${selectedNodeObj.uuid}`);
                            document.querySelector("#nodeLayer").insertBefore(node, document.querySelector("#nodeLayer").firstElementChild);
                            _.nodeList.splice(_.nodeList.indexOf(selectedNodeObj), 1);
                            _.nodeList.unshift(selectedNodeObj);
                        }
                    } else {
                        let node = document.querySelector(`#${nodeObj.uuid}`);
                        document.querySelector("#nodeLayer").insertBefore(node, document.querySelector("#nodeLayer").firstElementChild);
                        _.nodeList.splice(_.nodeList.indexOf(nodeObj), 1);
                        _.nodeList.unshift(nodeObj);
                    }
                }
            },
            {
                divider: true
            },
            {
                name: "选中相关关系",
                func: function () {
                    _.deselectAll();
                    let relatedEdgeList = _.findNodeEdges(nodeObj)
                    relatedEdgeList.forEach(edge => {
                        _.selectElement(edge);
                    });
                    if (relatedEdgeList.length > 1) {
                        _.calPublicProperties();
                    } else if (relatedEdgeList.length == 1) {
                        relatedEdgeList[0].initHtml();
                    }
                }
            },
            {
                divider: true
            },
            {
                name: "自动换行",
                func: function () {
                    let selectedNodeList = _.selectedElementList.filter(ele => ele.type == "node");
                    _.pushUndo();
                    if (selectedNodeList.length != 0) {
                        for (let selectedNodeObj of selectedNodeList) {
                            if (selectedNodeObj.hasComponent("text_node")) {
                                let text = selectedNodeObj.autoGetValue("text_node", "showText");
                                let lineList = text.split("\n");
                                let newText = "";
                                for (let i = 0; i < lineList.length; i++) {
                                    let currentLine = lineList[i];
                                    let j = 0;
                                    for (j = 0; j < currentLine.length; j += MAX_LINE_LENGTH) {
                                        newText += `${currentLine.slice(j, j + MAX_LINE_LENGTH)}\n`;
                                    }
                                    newText += `${currentLine.slice(j)}\n`;
                                }
                                selectedNodeObj.autoSetValue("text_node", "showText", newText);
                                _.modifyNodeExterior(selectedNodeObj);
                                _.modifyNodePhysics();
                            }
                        }
                    } else {
                        if (nodeObj.hasComponent("text_node")) {
                            let text = nodeObj.autoGetValue("text_node", "showText");
                            let lineList = text.split("\n");
                            let newText = "";
                            for (let i = 0; i < lineList.length; i++) {
                                let currentLine = lineList[i];
                                let j = 0;
                                for (j = 0; j < currentLine.length; j += MAX_LINE_LENGTH) {
                                    newText += `${currentLine.slice(j, j + MAX_LINE_LENGTH)}\n`;
                                }
                                newText += `${currentLine.slice(j)}\n`;
                            }
                            nodeObj.autoSetValue("text_node", "showText", newText);
                            _.modifyNodeExterior(nodeObj);
                            _.modifyNodePhysics();
                        }
                    }
                }
            },
            {
                divider: true
            },
            {
                name: "提取关键词",
                func: async function () {
                    _.extractNode(nodeObj, obj => {
                        obj.initHtml();
                    });
                }
            }
        ]
        this.initMenu(e, menu);
    }

    /**
     * 关系上右键菜单
     */
    initMenu_Edge(e, edgeObj) {
        let _ = this;
        let menu = [
            {
                name: "反向节点",
                func: function () {
                    _.pushUndo();
                    let selectedEdgeList = _.selectedElementList.filter(ele => ele.type == "edge");
                    if (selectedEdgeList.length != 0) {
                        for (let selectedEdgeObj of selectedEdgeList) {
                            let temp = selectedEdgeObj.source;
                            selectedEdgeObj.source = selectedEdgeObj.target;
                            selectedEdgeObj.target = temp;
                            _.modifyEdgeExterior(selectedEdgeObj);
                            _.modifyEdgePhysics();
                        }
                    } else {
                        let temp = edgeObj.source;
                        edgeObj.source = edgeObj.target;
                        edgeObj.target = temp;
                        _.modifyEdgeExterior(edgeObj);
                        _.modifyEdgePhysics();
                    }
                }
            }
        ]
        this.initMenu(e, menu);
    }


    initMenu(e, menuObj) {
        let _ = this;
        let domMenu = document.querySelector(".rightMenu");
        domMenu.innerHTML = "";
        domMenu.style.left = `${e.clientX}px`;
        domMenu.style.top = `${e.clientY}px`;
        domMenu.classList = "rightMenu rightMenu_show";
        menuObj.forEach(obj => {
            if (obj.name && obj.func) {
                let domMenuBlock = document.createElement("div");
                domMenuBlock.classList = "menuBlock";
                domMenuBlock.innerHTML = obj.name;
                domMenuBlock.onclick = function () {
                    obj.func();
                    _.hideMenu();
                };
                domMenu.appendChild(domMenuBlock);
            } else if (obj.divider) {
                let domMenuDivider = document.createElement("div");
                domMenuDivider.classList = "menuDivider";
                domMenu.appendChild(domMenuDivider);
            }
        });
        this.isShowRightMenu = true;
    }

    /**
     * 隐藏右键菜单
     */
    hideMenu() {
        let domMenu = document.querySelector(".rightMenu");
        domMenu.classList = "rightMenu rightMenu_hide";
        this.isShowRightMenu = false;
    }

    /**
     * 设置背景颜色
     */
    setBgColor(color) {
        this.bgColor = color;
        this.renderProperties.svg.style("background-color", color);
    }

    /**
     * 增加步骤到撤销列表
     */
    pushUndo() {
        this.undoMirror.unshift(this.toJson());
        if (this.undoMirror.length > UNDO_STEP) {
            this.undoMirror.pop();
        }
    }

    /**
     * 撤销
     */
    undo() {
        if (this.undoMirror.length >= 1) {
            this.clear(false);
            this.load(JSON.parse(this.undoMirror.shift()));
        } else {
            // 更新底部栏
            this.refreshBottomDom("🤐无法撤销");
        }
    }

    /**
     * 显示坐标系
     */
    refreshCoord(show = true) {
        this.isShowCoord = show;
        if (show) {
            d3.selectAll(".coordLine").style("opacity", 1);
        } else {
            d3.selectAll(".coordLine").style("opacity", 0);
        }
    }

    /**
     * 清空图谱
     */
    clear(cpl = true) {
        for (let node of this.nodeList) {
            this.nodeList = [];
            this.edgeList = [];
            for (let currentNode of this.nodes) {
                currentNode.remove();
            }
            for (let currentEdge of this.edges) {
                currentEdge.remove();
            }
            d3.selectAll(".layer").remove();
            // d3.select(".viewArea").remove();
            //d3.selectAll("svg").selectAll("*").remove();
            // 重启物理模拟
            this.renderProperties.simulation.on("tick", () => { })
        }
        this.nodes = [];
        this.edges = [];
        this.selectedElementList = [];
        if (cpl) {
            this.isControlDown = false;
            this.isShiftDown = false;
            this.copiedEdgeJsonList = [];
            this.copiedNodeJsonList = [];
        }
    }

    /**
     * 加载数据
     */
    load(jsonObj, refreshViewArea = false) {
        let nodeJsonList = jsonObj.nodeList;
        let edgeJsonList = jsonObj.edgeList;
        for (let nodeJson of nodeJsonList) {
            let node = LoadNodeFromJson(nodeJson);
            this.pushNode(node);
        }
        for (let edgeJson of edgeJsonList) {
            let edge = LoadEdgeFromJson(edgeJson, this.nodeList);
            this.pushEdge(edge);
        }
        this.bgColor = jsonObj.bgColor;
        this.render(refreshViewArea);
        window.setTimeout(() => {
            this.renderProperties.simulation.alphaTarget(0.02).restart();
            window.setTimeout(() => {
                this.renderProperties.simulation.stop();
                hideLoadingPage();
            }, 20);
        }, 300);
        // 清空组件列表
        document.querySelector(".panArea .listPan").innerHTML = "";
        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
    }

    /**
     * 重新加载图谱
     */
    reload() {
        showLoadingPage();
        window.setTimeout(() => {
            let graphJson = this.toJsonObj();
            this.clear();
            this.load(graphJson, false);
        }, 300);
        // 清空组件列表
        document.querySelector(".panArea .listPan").innerHTML = "";
        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
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

    /**
     * 计算节点和关系的总数，填充DOM
     */
    refreshBottomDom(info) {
        if (info) {
            document.querySelector("#structionInfo").innerHTML = `${info}`;
        } else {
            document.querySelector("#structionInfo").innerHTML = "";
        }
        document.querySelector("#nodeCount").innerHTML = `节点:${this.nodeList.length} | `;
        document.querySelector("#edgeCount").innerHTML = `关系:${this.edgeList.length} | `;
        document.querySelector("#selectedId").innerHTML = `选中的元素:<span style="letter-spacing:0">${this.selectedElementList[0] ? this.selectedElementList[0].uuid.slice(0, 11) + "..." : "#"}</span>`;
    }
}


export function LoadGraphFromJson(jsonObj) {
    let graph = new Graph();
    let nodeJsonList = jsonObj.nodeList;
    let edgeJsonList = jsonObj.edgeList;
    for (let nodeJson of nodeJsonList) {
        let node = LoadNodeFromJson(nodeJson);
        graph.pushNode(node);
    }
    for (let edgeJson of edgeJsonList) {
        let edge = LoadEdgeFromJson(edgeJson, graph.nodeList);
        graph.pushEdge(edge);
    }
    graph.bgColor = jsonObj.bgColor;
    return graph;
}