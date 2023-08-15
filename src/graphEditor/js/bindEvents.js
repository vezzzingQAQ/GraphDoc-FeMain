import { Graph, LoadGraphFromJson } from "./graph/graph";
import { saveAs } from 'file-saver';

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
        let file = new File([graph.toJson()], +new Date() + ".json", { type: "text/plain;charset=utf-8" });
        saveAs(file);
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        graph.exportImg();
    });
    document.querySelector("#openFile").addEventListener("click", () => {
        let elementInput = document.createElement("input");
        elementInput.type = "file";
        elementInput.click();
        elementInput.addEventListener("input", () => {
            try {
                let reader;
                let data;
                if (window.FileReader) {
                    reader = new FileReader();
                } else {
                    alert("你的浏览器不支持访问本地文件");
                }
                reader.readAsText(elementInput.files[0]);
                reader.addEventListener("load", (readRes) => {
                    graph.clear();
                    data = JSON.parse(readRes.target.result);
                    console.log(data)
                    graph.load(data);
                });
                reader.addEventListener("error", () => {
                    alert("打开文件失败");
                });
            } catch {

            }
        })
    })
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        graph.setBgColor(document.querySelector("#bgColorInput").value);
    });
    window.oncontextmenu = function (e) {
        //取消默认的浏览器自带右键
        e.preventDefault();
    }
}