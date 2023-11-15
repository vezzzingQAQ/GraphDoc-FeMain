export const CMD_LIST = {
    addNode: {
        in: function (nodeStr) {
            return `addNode--${nodeStr}`;
        },
        out: function (graph, nodeStr) {
            graph.cb_addNode(nodeStr);
        }
    },
    addEdge: {
        in: function (edgeStr) {
            return `addEdge--${edgeStr}`;
        },
        out: function (graph, edgeStr) {
            graph.cb_addEdge(edgeStr);
        }
    },
    removeNode: {
        in: function (nodeUuid) {
            return `removeNode--${nodeUuid}`;
        },
        out: function (graph, nodeUuid) {
            graph.cb_removeNode(nodeUuid);
        }
    },
    removeEdge: {
        in: function (edgeUuid) {
            return `removeEdge--${edgeUuid}`;
        },
        out: function (graph, edgeUuid) {
            graph.cb_removeEdge(edgeUuid);
        }
    },
    moveNodeToTop: {
        in: function (nodeUuid) {
            return `moveNodeToTop--${nodeUuid}`;
        },
        out: function (graph, nodeUuid) {
            graph.cb_moveNodeToTop(nodeUuid);
        }
    },
    moveNodeToBottom: {
        in: function (nodeUuid) {
            return `moveNodeToBottom--${nodeUuid}`;
        },
        out: function (graph, nodeUuid) {
            graph.cb_moveNodeToBottom(nodeUuid);
        }
    },
    modifyNode: {
        in: function (nodeUuid, toNodeStr) {
            return `modifyNode--${nodeUuid}->${toNodeStr}`;
        },
        out: function (graph, cmdStr) {
            let nodeUuid = cmdStr.split("->")[0]
            let nodeStr = cmdStr.substring(nodeUuid.length + 2);
            graph.cb_modifyNode(nodeUuid, nodeStr);
        }
    },
    modifyEdge: {
        in: function (edgeUuid, toEdgeStr) {
            return `modifyEdge--${edgeUuid}->${toEdgeStr}`;
        },
        out: function (graph, cmdStr) {
            let edgeUuid = cmdStr.split("->")[0]
            let edgeStr = cmdStr.substring(edgeUuid.length + 2);
            graph.cb_modifyEdge(edgeUuid, edgeStr);
        }
    },
    setBgColor: {
        in: function (bgColor) {
            return `setBgColor--${bgColor}`;
        },
        out: function (graph, bgColor) {
            graph.cb_setBgColor(bgColor);
        }
    }
}

export function fillCmd(cmdStr) {
    let cmdPre = cmdStr.split("--")[0];
    let cmdEnd = cmdStr.split("--")[cmdStr.split("--").length - 1];
    document.querySelector("#cmdList").innerHTML = `<li><span style="color:rgb(200,200,0)">${cmdPre}</span>--${cmdEnd}</li>` + document.querySelector("#cmdList").innerHTML;
    document.querySelector("#cmdInput").value = cmdStr;
}

export function doCmd(graph, cmdStr) {
    let cmd = cmdStr.split("--")[0];
    let cmdContent = cmdStr.substring(cmd.length + 2);
    if (CMD_LIST[cmd]) {
        CMD_LIST[cmd].out(graph, cmdContent);
    }
}