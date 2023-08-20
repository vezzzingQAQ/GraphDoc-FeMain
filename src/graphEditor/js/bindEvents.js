import { Graph, LoadGraphFromJson } from "./graph/graph";
import { saveAs } from 'file-saver';

import mainAboutPng from "./../../asset/img/mainAbout.png";

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
        let blob = new Blob([graph.toJson()]);
        saveAs(blob, +new Date() + ".vgd");
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        graph.exportSvg();
    });
    document.querySelector("#btnExport2").addEventListener("click", () => {
        graph.exportPng();
    });
    document.querySelector("#btnAuthorList").addEventListener("click", () => {
        document.querySelector("#windowAuthorList").style.opacity = 0.97;
        document.querySelector("#windowAuthorList").style.pointerEvents = "all";
        document.querySelector("#windowAuthorList").style.transition = "0.3s ease-in-out";
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
    // 关于窗口
    document.querySelector("#mainAboutImg").src = mainAboutPng;
    document.querySelector("#windowAuthorList span").addEventListener("click", () => {
        document.querySelector("#windowAuthorList").style.opacity = 0;
        document.querySelector("#windowAuthorList").style.pointerEvents = "none";
    });
}