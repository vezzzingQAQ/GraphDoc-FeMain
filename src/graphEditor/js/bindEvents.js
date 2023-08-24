import {
    reverseColorMode,
    uploadToServer,
    saveGraph,
    exportSvg,
    exportPng,
    showAuthorList,
    openGraph,
    setGraphBackgroundColor
} from "./event.js";

import mainAboutPng from "./../../asset/img/mainAbout.png";

/**
 * 
 * @param {Graph} graph initGraph()返回的图谱对象
 */
export function bindEvents(graph) {
    document.querySelector("#btnReverseMode").addEventListener("click", () => {
        reverseColorMode();
    });
    document.querySelector("#btnToJson").addEventListener("click", () => {
        uploadToServer(graph);
    });
    document.querySelector("#btnSave").addEventListener("click", () => {
        saveGraph(graph);
    });
    document.querySelector("#btnExport").addEventListener("click", () => {
        exportSvg(graph);
    });
    document.querySelector("#btnExport2").addEventListener("click", () => {
        exportPng(graph);
    });
    document.querySelector("#btnAuthorList").addEventListener("click", () => {
        showAuthorList();
    });
    document.querySelector("#openFile").addEventListener("click", () => {
        openGraph(graph);
    })
    document.querySelector("#bgColorInput").addEventListener("input", () => {
        setGraphBackgroundColor(graph);
    });
    document.querySelector("#mainAboutImg").src = mainAboutPng;
    document.querySelector("#windowAuthorList span").addEventListener("click", () => {
        document.querySelector("#windowAuthorList").style.opacity = 0;
        document.querySelector("#windowAuthorList").style.pointerEvents = "none";
    });
}

/**
 * 设置右键菜单
 */
export function initRightMenu() { }