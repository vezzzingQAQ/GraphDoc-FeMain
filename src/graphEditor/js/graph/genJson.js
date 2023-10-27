import { v4 as uuidv4 } from "uuid";
import { ComponentMap } from "./component";
import { loadGraphFromCode, showCodeError, showLoadingPage, showTextEditor } from "../event";

let jsonValid = true;

/**
 * 绑定数据
 * 这里的type可以为
 * json
 * text
 * csv
 * number
 */
export function bindData(key, name, data, info = "", type = "json") {
    jsonValid = true;
    let addedDomContainer = document.createElement("div");
    addedDomContainer.classList = "templateContainer";
    let addedDomTag = document.createElement("p");
    addedDomTag.classList = "templateTag";
    addedDomTag.innerHTML = `${name}<span>${type.toUpperCase()}</span>`;
    let addedDomInfo = document.createElement("p");
    addedDomInfo.classList = "templateInfo";
    addedDomInfo.innerHTML = info;
    let addedDomInput;
    if (type == "json" || type == "text" || type == "csv") {
        addedDomInput = document.createElement("textarea");
        addedDomInput.spellcheck = false;
        addedDomInput.classList = "templateData styleScrollBar";
        // 支持tab缩进
        addedDomInput.onkeydown = function (e) {
            if (e.keyCode == 9) {
                let position = this.selectionStart + 2;
                this.value = this.value.substr(0, this.selectionStart) + '  ' + this.value.substr(this.selectionStart);
                this.selectionStart = position;
                this.selectionEnd = position;
                this.focus();
                e.preventDefault();
            }
        };
        // 双击进入编辑模式
        addedDomInput.ondblclick = function () {
            showTextEditor(this, () => {
                updateData(key, type, addedDomInput);
            }, () => {
                genGraph();
            });
        }
    } else if (type == "number") {
        addedDomInput = document.createElement("input");
        addedDomInput.type = "number";
    } else if (type == "vgd") {
        addedDomInput = document.createElement("input");
        addedDomInput.type = "file";
        addedDomInput.accept=".vgd";
    }

    if (type == "json") {
        addedDomInput.value = JSON.stringify(data, null, 2);
    } else if (type == "text") {
        addedDomInput.value = data;
    } else if (type == "csv") {
        addedDomInput.value = data;
    } else if (type == "number") {
        addedDomInput.value = data;
    }

    // 用户输入时更新数据
    addedDomInput.oninput = function () {
        updateData(key, type, addedDomInput);
    }

    function genGraph() {
        if (jsonValid) {
            showLoadingPage();
            window.setTimeout(() => {
                loadGraphFromCode();
            }, 300);
        } else {
            showCodeError("JSON格式错误");
        }
    }

    document.querySelector("#btnExecuteCode").onclick = function () {
        genGraph();
    }

    addedDomContainer.appendChild(addedDomTag);
    addedDomContainer.appendChild(addedDomInfo);
    addedDomContainer.appendChild(addedDomInput);

    window[key] = data;

    document.querySelector(".dyaTemplateArea").style.display = "block";
    document.querySelector("#dyaTemplateContent").appendChild(addedDomContainer);
}

export function updateData(key, type, addedDomInput) {
    jsonValid = true;
    if (type == "json") {
        try {
            window[key] = JSON.parse(addedDomInput.value);
        } catch {
            jsonValid = false;
        }
    } else if (type == "vgd") {
        try {
            let reader;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(addedDomInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                let data = JSON.parse(readRes.target.result);
                window[key] = data;
            });
            reader.addEventListener("error", () => {
                alert("打开文件失败");
            });
        } catch {
            console.error("打开文件出错");
        }
    } else {
        window[key] = addedDomInput.value;
    }
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