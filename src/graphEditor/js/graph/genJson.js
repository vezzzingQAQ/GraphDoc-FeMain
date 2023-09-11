import { v4 as uuidv4 } from "uuid";
import { ComponentMap } from "./component";

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
                round: null,
                shape: "circle",
                dividerColor: null,
                bgColor: "#000f00",
                dividerStroke: null,
                strokeColor: "#ffd500",
                strokeStyle: "0",
                strokeWidth: 0.5
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