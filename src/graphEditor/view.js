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

import "./css/view.less";
import "./css/graph.less";
import { bindEvents } from "./js/bindEvents";
import { DISPLAY_PAGE } from "../public/js/urls";

window.addEventListener("load", async () => {
    let graph = await initGraph();
    bindEvents(graph);
    document.querySelector("#back").addEventListener("click",function(){
        window.location=DISPLAY_PAGE;
    });
    document.querySelector("#back").addEventListener("click",function(){
        window.location=DISPLAY_PAGE;
    });
})