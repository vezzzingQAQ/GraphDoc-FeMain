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
 * |_constructor(owner,showName,key)                          - 构造函数，传入一个graph的指针
 * |_addComponent(component)                                  - 添加组件
 * |_getComponent(key)                                        - 获取组件
 * |_initHtml()                                               - 将元素的所有属性罗列到属性面板中
 * |_toJsonObj()                                              - 将元素的属性转为JsonObject，提供给渲染器绘制
 * |_autoGetValue(componentKey,valueKey,defaultValue,afterFn) - 根据组件键和属性键获取值
 * |_autoSetValue(componentKey,valueKey,value)                - 根据组件键和属性键获设置值
 * |____Node
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

    // getters&setters
    getUuid() {
        return this.uuid;
    }
    setUuid(str) {
        this.uuid = str;
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
        return domCompContianer;
    }

    /**
     * 转为JSON
     */
    toJsonObj() {
        let jsonObj = {};
        jsonObj.uuid = this.uuid;
        jsonObj.components = {};
        for (let key in this.componentMap) {
            jsonObj.components[key] = this.componentMap[key].toJsonObj();
        }
        return jsonObj;
    }
}

export class Node extends Element {
    /**
     * 节点类
     */
    constructor() {
        super();
        this.tempFixed = false;
    }

    /**
     * 由组件来调用，用户不能调用
     * · 组件删除自身
     */
    removeComponent(component) {
        component.dom.remove();
        delete this.componentMap[component.key]
        this.owner.modifyNode(this);
    }
}

export class Edge extends Element {
    /**
     * 关系类
     */
    constructor() {
        super();
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
        } else {
            this.source = nodeSource;
        }
    }

    /**
     * 设置终点
     * @param {Node} nodeTarget 设为终点的node
     */
    setTarget(nodeTarget) {
        if (!nodeTarget) {
            console.error("nodeTo不合法");
        } else {
            this.target = nodeTarget;
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
}

import { Graph } from "./graph";
import { C_E_Exterior, C_E_Physics, C_N_Exterior, C_N_Link, C_N_Physics, C_N_Text, LoadComponentFromJson } from "./component";

/**
 * 创建基本节点
 * @returns node节点
 */
export function CreateBasicNode() {
    let node = new Node();
    node.addComponent(new C_N_Exterior("外观", "exterior_node"));
    node.addComponent(new C_N_Physics("物理", "physics_node"));
    return node;
}

/**
 * 创建关系
 */
export function CreateBasicEdge(source, target) {
    let edge = new Edge();
    edge.setSource(source);
    edge.setTarget(target);
    edge.addComponent(new C_E_Exterior("外观", "exterior_edge"));
    edge.addComponent(new C_E_Physics("物理", "physics_edge"));
    return edge;
}

/**
 * 创建链接节点
 * @returns node节点
 */
export function CreateLinkNode() {
    let node = CreateBasicNode();
    node.addComponent(new C_N_Text("文本", "text_node"));
    node.addComponent(new C_N_Link("外链", "link_node"));
    return node;
}

/**
 * 创建文本节点
 * @returns node节点
 */
export function CreateTextNode() {
    let node = CreateBasicNode();
    node.addComponent(new C_N_Text("文本", "text_node"));
    return node;
}

/**
 * 从JsonObject生成Node
 * @param {object} jsonObj 节点的JSON储存
 */
export function LoadNodeFromJson(jsonObj) {
    let createdNode = new Node();
    createdNode.setUuid(jsonObj.uuid);
    for (let componentKey in jsonObj.components) {
        let createdComponent = LoadComponentFromJson(componentKey, jsonObj.components[componentKey]);
        createdNode.addComponent(createdComponent);
    }
    return createdNode;
}

/**
 * 从JsonObject生成Edge
 * @param {object} jsonObj 节点的JSON储存
 * @param {Node} nodeList node列表
 */
export function LoadEdgeFromJson(jsonObj, nodeList) {
    let createdEdge = new Edge();
    createdEdge.setUuid(jsonObj.uuid);
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
    createdEdge.setSource(sourceNode);
    createdEdge.setTarget(targetNode)
    return createdEdge;
}