/**
 * --------------------- 
 * PROJECT
 * GraphDoc
 * ---------------------
 * v e z tech
 * project by vezzzingQAQ
 * z z z Studio
 * from 2023.8.3
 * ---------------------
 */

import { initGraph } from "./js/initGraph";

import "./css/index.less";
import "./css/component.less";
import "./css/graph.less";
import "./css/centerWindow.less";
import "./css/loadGraph.less";
import { bindEvents } from "./js/bindEvents";

window.addEventListener("load", async () => {
    let graph = await initGraph();
    bindEvents(graph);
})