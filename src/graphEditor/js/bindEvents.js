import { Graph } from "./graph/graph";

// 界面色彩配置
let darkMode = true;

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnReverseMode").addEventListener("click", () => {
        darkMode = !darkMode;
        if (darkMode) {
            document.querySelector(".mainWindow").classList = "mainWindow darkMode";
        } else {
            document.querySelector(".mainWindow").classList = "mainWindow lightMode";
        }
    });
    document.querySelector("#btnToJson").addEventListener("click", () => {
        console.log(graph.toJson());
    });
    document.querySelector("#btnSave").addEventListener("click", () => {
        let elementA = document.createElement("a");
        elementA.download = +new Date() + ".vgd";
        elementA.style.display = "none";
        let blob = new Blob([graph.toJson()]);
        elementA.href = URL.createObjectURL(blob);
        document.body.appendChild(elementA);
        elementA.click();
        document.body.removeChild(elementA);
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        graph.exportImg();
    });
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        graph.setBgColor(document.querySelector("#bgColorInput").value);
    });
    window.oncontextmenu = function (e) {
        //取消默认的浏览器自带右键 很重要！！
        e.preventDefault();
    }
}