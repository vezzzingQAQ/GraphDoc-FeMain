import { Graph } from "./graph/graph";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnToJson").addEventListener("click", () => {
        console.log(graph.toJson());
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        graph.exportImg();
    });
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        graph.setBgColor(document.querySelector("#bgColorInput").value);
    })
    window.oncontextmenu = function (e) {
        //取消默认的浏览器自带右键 很重要！！
        e.preventDefault();
    }
}