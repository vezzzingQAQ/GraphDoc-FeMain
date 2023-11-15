export const CMD_LIST = {
    addNode: {
        in: function (nodeStr) {
            return `addNode--${nodeStr}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    addEdge: {
        in: function (edgeStr) {
            return `addEdge--${edgeStr}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    removeNode: {
        in: function (nodeUuid) {
            return `removeNode--${nodeUuid}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    removeEdge: {
        in: function (edgeUuid) {
            return `removeEdge--${edgeUuid}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    moveNodeToTop: {
        in: function (nodeUuid) {
            return `moveNodeToTop--${nodeUuid}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    moveNodeToBottom: {
        in: function (nodeUuid) {
            return `moveNodeToBottom--${nodeUuid}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    modifyNode: {
        in: function (nodeUuid, toNodeStr) {
            return `modifyNode--${nodeUuid}->${toNodeStr}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    modifyEdge: {
        in: function (edgeUuid, toEdgeStr) {
            return `modifyEdge--${edgeUuid}->${toEdgeStr}`;
        },
        out: function (graph, cmdStr) {

        }
    },
    setBgColor: {
        in: function (bgColor) {
            return `setBgColor--${bgColor}`;
        },
        out: function (graph, cmdStr) {

        }
    }
}

export function fillCmd(cmdStr) {
    let cmdPre = cmdStr.split("--")[0];
    let cmdEnd = cmdStr.split("--")[cmdStr.split("--").length - 1];
    document.querySelector("#cmdList").innerHTML = `<li><span style="color:rgb(200,200,0)">${cmdPre}</span>--${cmdEnd}</li>` + document.querySelector("#cmdList").innerHTML;
    document.querySelector("#cmdInput").value = cmdStr;
}