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
import "./css/panArea.less";
import "./css/leftWindow.less";
import "./css/loadGraph.less";
import "./css/menu.less";
import { bindEvents } from "./js/bindEvents";
import { setWindowIcon } from "../public/js/iconSetter";

window.addEventListener("load", async () => {
    setWindowIcon();
    let graph = await initGraph();
    bindEvents(graph);
});

if (process.env.PACK_MODE == "production")
    if (process.env.RUN_ENV == "web")
        window.addEventListener("beforeunload", function (e) {
            e.returnValue = "确定离开当前页面吗？";
        });

console.log(`
<-往左边拖让vezzzing讲话

Powered By VezzzingQAQ
GraphDocCoreV1.1

|\\        /|    GraphDoc
< \\------/ >    图记
 ||||||||||     2023.7-2023.11
 \\ _    _ \\     谢谢你使用我的作品!!
 \\ w -- w \\     Thanks for using my work!!
    /\\/\\        如果能给你带来一点便利的话那是再好不过了!!
   / V  \\       It would be great if it can
  \\      \\      bring you a little convenience!!
                     
Z Z Z studio &       
T E C H vezzzing    

更多作品请访问:
http://vezzzing.cn/vezzzingsBuilding/dist/main.html

想联系vezzzing?:
http://vezzzing.cn/GraphDoc/Main/dist/107a7f01816e8855b76f8e0aaca62215.jpg

请vezzzing喝奶茶?:
http://vezzzing.cn/GraphDoc/Main/dist/efe2ac1ec63322ab195ea69606ecaed9.jpg
`);
