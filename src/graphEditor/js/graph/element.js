/**
 * 架构图：
 * 
 * Graph
 *   |_Node/Edge
 *       |_Component
 *          |_SubComponent
 * 
 * 从Graph访问Node/Edge：
 * · 直接获取data属性
 * 从Node/Edge访问Graph元素：
 * · 用node/edge的uuid来进行querySelect
 * · 这个uuid在Graph.addNode/Edge时自动绑定，作为元素的id
 * 
 * 从Node/Edge访问Component：
 * · Node/Edge.getComponent(componentKey)
 * 从Component访问Node/Edge:
 * · Component.owner
 * 
 * 从Component访问SubComponent:
 * · Component.getValue(key)
 * 从SubComponent访问Component:
 * · SubComponent.owner
 * 
 * 从属性面板更新SVG：
 * · 修改属性面板的值之后触发回调函数
 * · 在这个回调函数中调用setValue设置subComponent的value值
 * · 在这个回调函数中，触发subComponent的updateGraph函数
 * · 这个函数不断寻找上级owner，最终找到Graph
 * · 调用Graph的modifyNode函数来更新SVG
 * 从SVG更新属性面板(物理系统更新)：
 * · d3更新了节点的属性
 * 
 * 
 * 类文档：
 * 
 * Element
 * |_owner                                                    - 指向图谱的指针，在上一个层级(Graph)进行绑定
 * |_uuid                                                     - 元素的key，用来让图谱寻址，在图谱的addNode函数中自动生成
 * |_componentMap                                             - 元素的组件映射表(string->component*)
 * |_type                                                     - node或edge
 * |_constructor(owner,showName,key)                          - 构造函数，传入一个graph的指针
 * |_addComponent(component)                                  - 添加组件
 * |_getComponent(key)                                        - 获取组件
 * |_initHtml()                                               - 将元素的所有属性罗列到属性面板中
 * |_toJsonObj()                                              - 将元素的属性转为JsonObject，提供给渲染器绘制
 * |_autoGetValue(componentKey,valueKey,defaultValue,afterFn) - 根据组件键和属性键获取值
 * |_autoSetValue(componentKey,valueKey,value)                - 根据组件键和属性键获设置值
 * |_initComponentAddDom()                                    - 生成组件添加面板的DOM元素
 * |____Node
 * |    |_x,y
 * |    |_vx,vy
 * |    |_cx,cy
 * |    |_toJsonObj()                                         - 重写toJsonObj方法
 * |    |_removeComponent(component)                          - 删除指定的component，由component类调用     
 * |____Edge
 *      |_source                                              - 从哪个节点
 *      |_target                                              - 指向哪个节点
 *      |_setSource                                           - 绑定source
 *      |_setTarget                                           - 绑定target
 *      |_toJsonObj()                                         - 重写toJsonObj方法
 *      |_removeComponent(component)                          - 删除指定的component，由component类调用     
 * 创建node：
 * · 用工厂函数进行创建
 * 
 * JSON储存：
 * · Node 
 * | [
 * |     {
 * |         "uid":"zznode3fxxx",
 * |         "components":{
 * |             "exterior_node":{
 * |                  "shape":"circle"
 * |                  ......
 * |             }
 * |             ......
 * |         }
 * |     }
 * | ]
 * · Edge
 * | [
 * |     {
 * |         "uid":"zzzedgexxxxxx",
 * |         "source":"zzznodexxxxx",
 * |         "target":"zzznodexxxxx",
 * |         "components":{
 * |              ......
 * |         }
 * |     }
 * | ]
 * 
 * 从JSON生成：
 * · 提取类的JSON
 * · 创建一个空白的node类
 * · 用将JSON分解到组件级别，即：
 * | "link":{"url":"xxx.com"}
 * · 调用nodeClass.js的LoadComponentFromJson来加载组件
 * · 通过addComponent将这个组件加载到新创建的node类
 * 
 * by vezzzing 2023.8.3
 * z z z studio
 */

class Element {
    /**
     * 节点和关系的基类
     */
    constructor() {
        this.owner = null;
        this.uuid = "";
        this.componentMap = {};
        this.type = null;
    }

    /**
     * 添加组件
     * @param {Component} component 要添加的组件
     */
    addComponent(component) {
        if (!this.componentMap[component.key]) {
            this.componentMap[component.key] = component;
            component.owner = this;
        } else {
            console.error(`尝试添加component失败`)
            console.error(`不能添加已经存在的component:${component.key}`)
        }
    }

    /**
     * 获取指定的组件
     * · 用key进行组件寻址
     * @param {string} componentKey 组件的key
     */
    getComponent(componentKey) {
        if (this.componentMap[componentKey]) {
            return this.componentMap[componentKey];
        } else {
            console.error(`尝试获取component失败`);
            console.error(`不存在key为${componentKey}的节点`);
            return false;
        }
    }

    /**
     * 判断元素是否拥有某个组件
     * @param {string} componentKey 组件key
     * @returns 布尔值，是否有这个组件
     */
    hasComponent(componentKey) {
        if (this.componentMap[componentKey]) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 自动获取value
     * 简化这部分代码
     * · let x = d.hasComponent("physics_node") ? d.getComponent("physics_node").getValue("position").x : 0
     * | let x = d.autoGetValue("physics_node", "position", 0, (value) => { return value.x });
     */
    autoGetValue(componentKey, valueKey, defaultValue, afterFn = (value) => { return value }) {
        if (this.hasComponent(componentKey)) {
            return afterFn(this.getComponent(componentKey).getValue(valueKey));
        } else {
            return defaultValue;
        }
    }

    /**
     * 自动设置key
     */
    autoSetValue(componentKey, valueKey, value) {
        if (this.hasComponent(componentKey)) {
            this.getComponent(componentKey).setValue(valueKey, value)
        }
    }

    /**
     * 转为HTML属性面板
     */
    initHtml() {
        let domCompContianer = document.createElement("div");
        domCompContianer.classList = "compContainer";
        let keyList = [];
        for (let key in this.componentMap) {
            keyList.push(key);
        }
        keyList = keyList.reverse();
        for (let key of keyList) {
            domCompContianer.appendChild(this.componentMap[key].initHtml());
        }
        // 生成组件添加DOM
        this.initComponentAddDom();
        // 添加到文档
        document.querySelector(".panArea .listPan").innerHTML = "";
        document.querySelector(".panArea .listPan").appendChild(domCompContianer);
    }

    /**
     * 转为JSON
     */
    toJsonObj() /*override*/ { }

    /**
     * 生成组件列表DOM元素
     */
    initComponentAddDom() {
        let componentList = [];
        for (let key in ComponentMap) {
            if ((!this.hasComponent(key)) && (ComponentMap[key].type == this.type)) {
                componentList.push(ComponentMap[key]);
            }
        }
        let domContainer = document.createElement("div");
        domContainer.classList = "componentAddContainer container";
        for (let componentObj of componentList) {
            let domComponentAddBtn = document.createElement("div");
            domComponentAddBtn.classList = "componentAddBtn";
            domComponentAddBtn.innerText = componentObj.showName;
            // 点击添加组件
            domComponentAddBtn.addEventListener("click", () => {
                let addedComponent = new componentObj.class(componentObj.showName, componentObj.key);
                domComponentAddBtn.remove();
                this.addComponent(addedComponent);
                document.querySelector(".panArea .listPan").insertAdjacentElement("afterbegin", addedComponent.initHtml());
                // 更新图表
                if (this.type == "node") {
                    this.owner.modifyNodeExterior(this);
                    this.owner.modifyNodePhysics();
                } else {
                    this.owner.modifyEdge(this);
                }
            });
            domContainer.appendChild(domComponentAddBtn);
        }
        // 添加到文档
        document.querySelector(".panArea .topPan .addComponent .content").innerHTML = "";
        document.querySelector(".panArea .topPan .addComponent .content").appendChild(domContainer);
    }
}

export class Node extends Element {
    /**
     * 节点类
     */
    constructor() {
        super();
        this.type = "node";
        this.tempFixed = false;
        this.x;
        this.y;
        this.vx;
        this.vy;
        this.cx;
        this.cy;
    }

    /**
     * 转为JSON
     */
    toJsonObj() {
        let jsonObj = {};
        jsonObj.uuid = this.uuid;
        jsonObj.components = {};
        jsonObj.vx = this.vx;
        jsonObj.vy = this.vy;
        jsonObj.x = this.x;
        jsonObj.y = this.y;
        jsonObj.cx = this.cx;
        jsonObj.cy = this.cy;
        for (let key in this.componentMap) {
            jsonObj.components[key] = this.componentMap[key].toJsonObj();
        }
        return jsonObj;
    }

    /**
     * 由组件来调用，用户不能调用
     * · 组件删除自身
     */
    removeComponent(component) {
        component.dom.remove();
        delete this.componentMap[component.key];
        this.initComponentAddDom();
        this.owner.modifyNodeExterior(this);
        this.owner.modifyNodePhysics();
    }
}

export class Edge extends Element {
    /**
     * 关系类
     */
    constructor() {
        super();
        this.type = "edge";
        this.source = null;
        this.target = null;
    }

    /**
     * 设置起点
     * @param {Node} nodeSource 设为起点的node
     */
    setSource(nodeSource) {
        if (!nodeSource) {
            console.error("nodeSource不合法");
            return false;
        } else {
            this.source = nodeSource;
            return true;
        }
    }

    /**
     * 设置终点
     * @param {Node} nodeTarget 设为终点的node
     */
    setTarget(nodeTarget) {
        if (!nodeTarget) {
            console.error("nodeTo不合法");
            return false;
        } else {
            this.target = nodeTarget;
            return true;
        }
    }

    toJsonObj() {
        let jsonObj = {};
        jsonObj.uuid = this.uuid;
        jsonObj.source = this.source.uuid;
        jsonObj.target = this.target.uuid;
        jsonObj.components = {};
        for (let key in this.componentMap) {
            jsonObj.components[key] = this.componentMap[key].toJsonObj();
        }
        return jsonObj;
    }

    /**
     * 由组件来调用，用户不能调用
     * · 组件删除自身
     */
    removeComponent(component) {
        component.dom.remove();
        delete this.componentMap[component.key];
        this.initComponentAddDom();
        this.owner.modifyEdgeExterior(this);
        this.owner.modifyEdgePhysics(this);
    }

}

import {
    C_E_Exterior,
    C_E_Physics,
    C_E_ScaleHover,
    C_N_Audio,
    C_N_Exterior,
    C_N_Link,
    C_N_Physics,
    C_N_ScaleHover,
    C_N_Tag,
    C_N_Text,
    ComponentMap,
    LoadComponentFromJson
} from "./component";

/**
 * 创建基本节点
 * @returns node节点
 */
export function CreateBasicNode() {
    let node = new Node();
    node.addComponent(new C_N_Exterior(ComponentMap.exterior_node.showName, "exterior_node"));
    node.addComponent(new C_N_Physics(ComponentMap.physics_node.showName, "physics_node"));
    node.addComponent(new C_N_Tag(ComponentMap.tag_node.showName, "tag_node"));
    return node;
}

/**
 * 创建关系
 */
export function CreateBasicEdge(source, target) {
    let edge = new Edge();
    edge.setSource(source);
    edge.setTarget(target);
    edge.addComponent(new C_E_Exterior(ComponentMap.exterior_edge.showName, "exterior_edge"));
    edge.addComponent(new C_E_Physics(ComponentMap.physics_edge.showName, "physics_edge"));
    edge.addComponent(new C_E_ScaleHover(ComponentMap.scaleHover_edge.showName, "scaleHover_edge"));
    return edge;
}

/**
 * 创建链接节点
 * @returns node节点
 */
export function CreateLinkNode() {
    let node = CreateBasicNode();
    node.addComponent(new C_N_Text(ComponentMap.text_node.showName, "text_node"));
    node.addComponent(new C_N_Link(ComponentMap.link_node.showName, "link_node"));
    return node;
}

/**
 * 创建文本节点
 * @returns node节点
 */
export function CreateTextNode() {
    let node = CreateBasicNode();
    node.addComponent(new C_N_Text(ComponentMap.text_node.showName, "text_node"));
    return node;
}

/**
 * 从JsonObject生成Node
 * @param {object} jsonObj 节点的JSON储存
 */
export function LoadNodeFromJson(jsonObj) {
    let createdNode = new Node();
    createdNode.uuid = jsonObj.uuid;
    createdNode.vx = 0;
    createdNode.vy = 0;
    createdNode.x = jsonObj.x;
    createdNode.y = jsonObj.y;
    createdNode.fx = null;
    createdNode.fy = null;
    createdNode.isMove = false;
    // 适配旧版本
    createdNode.cx = jsonObj.cx ? jsonObj.cx : jsonObj.x;
    createdNode.cy = jsonObj.cy ? jsonObj.cy : jsonObj.y;
    for (let componentKey in jsonObj.components) {
        let createdComponent = LoadComponentFromJson(componentKey, jsonObj.components[componentKey]);
        createdNode.addComponent(createdComponent);
    }
    // 是否是固定节点
    if (createdNode.autoGetValue("physics_node", "fixPosition")) {
        createdNode.x = createdNode.cx;
        createdNode.y = createdNode.cy;
    }
    //temp
    // if (createdNode.autoGetValue("img_node", "path"))
    //     createdNode.autoSetValue("img_node", "path", createdNode.autoGetValue("img_node", "path").replace("/media/images/", ""))
    // if (createdNode.autoGetValue("video_node", "path"))
    //     createdNode.autoSetValue("video_node", "path", createdNode.autoGetValue("video_node", "path").replace("/media/files/", ""))
    // if (createdNode.autoGetValue("file_node", "path"))
    //     createdNode.autoSetValue("file_node", "path", createdNode.autoGetValue("file_node", "path").replace("/media/videos/", ""))

    return createdNode;
}

/**
 * 从JsonObject生成Edge
 * @param {object} jsonObj 节点的JSON储存
 * @param {Node} nodeList node列表
 */
export function LoadEdgeFromJson(jsonObj, nodeList) {
    let createdEdge = new Edge();
    createdEdge.uuid = jsonObj.uuid;
    for (let componentKey in jsonObj.components) {
        let createdComponent = LoadComponentFromJson(componentKey, jsonObj.components[componentKey]);
        createdEdge.addComponent(createdComponent);
    }
    let sourceNode, targetNode;
    for (let node of nodeList) {
        if (node.uuid == jsonObj.source) {
            sourceNode = node;
        } else if (node.uuid == jsonObj.target) {
            targetNode = node;
        }
    }
    if (createdEdge.setSource(sourceNode) && createdEdge.setTarget(targetNode)) {
        return createdEdge;
    } else {
        console.log(sourceNode, targetNode)
        return null;
    }
}