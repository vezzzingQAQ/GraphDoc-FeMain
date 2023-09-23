import { v4 as uuidv4 } from "uuid";
import { ComponentMap } from "./component";
import { loadGraphFromCode, showCodeError } from "../event";

let jsonValid = false;

/**
 * 绑定数据
 * 这里的type可以为
 * json
 * text
 * csv
 */
export function bindData(key, name, data, info = "", type = "json") {
    let addedDomContainer = document.createElement("div");
    addedDomContainer.classList = "templateContainer";
    let addedDomTag = document.createElement("p");
    addedDomTag.classList = "templateTag";
    addedDomTag.innerHTML = `${name}<span>${type.toUpperCase()}</span>`;
    let addedDomInfo = document.createElement("p");
    addedDomInfo.classList = "templateInfo";
    addedDomInfo.innerHTML = info;
    let addedDomInput = document.createElement("textarea");
    addedDomInput.spellcheck = false;
    addedDomInput.classList = "templateData styleScrollBar";
    if (type == "json") {
        addedDomInput.value = JSON.stringify(data, null, 2);
        jsonValid = true;
    } else if (type == "text") {
        addedDomInput.value = data;
    } else if (type == "csv") {
        addedDomInput.value = data;
    }
    document.querySelector("#btnExecuteCode").onclick = function () {
        if (type == "json") {
            jsonValid = true;
            try {
                window[key] = JSON.parse(addedDomInput.value);
            } catch {
                jsonValid = false;
            }
            if (jsonValid) {
                document.querySelector("#loadGraph").style.opacity = 1;
                window.setTimeout(() => {
                    loadGraphFromCode();
                }, 1);
            } else {
                showCodeError("数据有bug( ´･･)ﾉ(._.`)");
            }
        } else if (type == "text") {
            window[key] = addedDomInput.value;
            document.querySelector("#loadGraph").style.opacity = 1;
            window.setTimeout(() => {
                loadGraphFromCode();
            }, 1);
        } else if (type == "csv") {
            window[key] = addedDomInput.value;
            document.querySelector("#loadGraph").style.opacity = 1;
            window.setTimeout(() => {
                loadGraphFromCode();
            }, 1);
        }
    }
    addedDomContainer.appendChild(addedDomTag);
    addedDomContainer.appendChild(addedDomInfo);
    addedDomContainer.appendChild(addedDomInput);

    window[key] = data;

    document.querySelector("#dyaTemplateContent").appendChild(addedDomContainer);
}

export class VGraph {
    constructor(config = {
        bgColor: "#000000"
    }) {
        this.bgColor = config.bgColor;
        this.nodeList = [];
        this.edgeList = [];
    }
    setBgColor(color) {
        this.bgColor = color;
    }
    addNode(node) {
        this.nodeList.push(node);
    }
    addEdge(edge) {
        this.edgeList.push(edge);
    }
    toJson() {
        return JSON.stringify({
            bgColor: this.bgColor,
            nodeList: this.nodeList,
            edgeList: this.edgeList
        });
    }
}

export class VNode {
    constructor() {
        this.uuid = `zznode${uuidv4().split("-").join("")}`;
        this.components = {
            exterior_node: {
                size: {
                    x: 10,
                    y: 1
                },
                sizeAuto: true,
                round: 0,
                rotate: 0,
                scale: 1,
                shape: "circle",
                dividerColor: null,
                bgColor: "#000f00",
                dividerStroke: null,
                strokeColor: "#ffd500",
                strokeStyle: "0",
                strokeWidth: 0.5,
                opacity: 1
            },
            physics_node: {
                dividerCollision: null,
                collisionRadius: 10,
                collisionRadiusAuto: true,
                dividerManyBodyForce: null,
                manyBodyForceStrength: 80,
                manyBodyForceRangeMin: 10,
                manyBodyForceRangeMax: 112,
                dividerManyFixPosition: null,
                fixPosition: true
            }
        }
        this.vx = 0;
        this.vy = 0;
        this.data = {};
    }
    addComponent(componentKey) {
        let addedComponent = new ComponentMap[componentKey].class(ComponentMap[componentKey].showName, componentKey);
        this.components[componentKey] = addedComponent.toJsonObj();
    }
    toJsonObj() {
        return {
            uuid: this.uuid,
            components: this.components,
            vx: this.vx,
            vy: this.vy,
            x: this.x,
            y: this.y,
            cx: this.cx,
            cy: this.cy
        }
    }
}

export class VEdge {
    constructor(source, target) {
        this.uuid = `zznode${uuidv4().split("-").join("")}`;
        this.components = {
            exterior_edge: {
                strokeColor: "#666666",
                strokeStyle: "dot",
                strokeType: "line",
                strokeWidth: 0.6
            },
            physics_edge: {
                linkStrength: 0.8,
                linkDistance: 398.98497018964906
            },
        }
        this.source = source.uuid;
        this.target = target.uuid;
        this.data = {};
    }
    toJsonObj() {
        return {
            uuid: this.uuid,
            source: this.source,
            target: this.target,
            components: this.components
        }
    }
}