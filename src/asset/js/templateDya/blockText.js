function bind() {
    bindData("text", "格式化文本", `一级内容
  二级内容
    三级内容1
    三级内容2
      四级内容1
      四级内容2
  二级内容2
    三级内容
      四级内容`, "以两个空格(TAB)控制缩进", "text");
    bindData("paddingX", "横向间距", 200, "图谱绘制的横向间距", "number");
}

function main() {

    let textBlockList = [];
    let maxLayer = 0;

    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    let lineList = text.split("\n");
    for (let i = 0; i < lineList.length; i++) {
        let currentLine = lineList[i];
        let j = 0;
        for (j = 0; j < currentLine.length; j++) {
            if (currentLine[j] != " ") {
                break;
            }
        }
        let layer = Math.floor(j / 2);
        if (layer > maxLayer) maxLayer = layer;
        textBlockList.push({
            layer: layer,
            content: currentLine.slice(j)
        });
    }

    // 寻找指定节点的父节点
    function getParent(index) {
        for (let i = index; i >= 0; i--) {
            if (textBlockList[i].layer < textBlockList[index].layer) {
                return i;
            }
        }
    }

    // 建立层级结构
    let layerBlock = [];
    for (let i = 0; i <= maxLayer; i++) {
        layerBlock.push([]);
    }

    // 将节点放入层级结构
    for (let i = 0; i < textBlockList.length; i++) {
        layerBlock[textBlockList[i].layer].push(textBlockList[i]);
    }

    // 建立指向关系
    for (let i = 0; i < textBlockList.length; i++) {
        if (textBlockList[i].layer != 0) {
            textBlockList[i].parentIndex = getParent(i);
        }
    }

    // 绘制节点
    for (let i = 0; i < layerBlock.length; i++) {
        for (let j = 0; j < layerBlock[i].length; j++) {
            let node = new VNode();
            node.components["physics_node"]["fixPosition"] = true;
            // node.components["exterior_node"]["sizeAuto"] = false;
            // node.components["exterior_node"]["size"] = {
            //     x: layerBlock[i][j].content.length*10,
            //     y: 50
            // };
            node.components["exterior_node"]["strokeWidth"] = 1;
            node.components["exterior_node"]["strokeColor"] = "#444444";
            node.components["exterior_node"]["bgColor"] = "#eeeeee";
            node.components["exterior_node"]["shape"] = "rect";
            node.components["exterior_node"]["round"] = 3;

            node.x = i * paddingX;
            node.y = j * 50;

            node.addComponent("text_node");
            node.components["text_node"]["showText"] = layerBlock[i][j].content;
            node.components["text_node"]["textColor"] = "#000000";

            graph.addNode(node);

            layerBlock[i][j].node = node;
        }
    }

    // 绘制关系
    for (let i = 0; i < textBlockList.length; i++) {
        if (textBlockList[i].parentIndex != undefined) {
            let edge = new VEdge(textBlockList[textBlockList[i].parentIndex].node, textBlockList[i].node);
            edge.components["exterior_edge"]["strokeWidth"] = 1;
            edge.components["exterior_edge"]["strokeType"] = "line";
            graph.addEdge(edge);
        }
    }

    return graph;
}