import { Graph } from "./graph/graph";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnToJson").addEventListener("click", () => {
        console.log(graph.toJson());
    });
}