/**
 * 3n+1猜想的可视化
 * 关于3n+1猜想：
 * https://zh.wikipedia.org/zh-hans/%E8%80%83%E6%8B%89%E5%85%B9%E7%8C%9C%E6%83%B3
 * 
 * 从任意一个正整数开始，如果是奇数就乘以3加1，如果是偶数就除以2
 * 最后会回归4-2-1循环
 * 
 * 如果我们从1开始反推，理论上既可以得到一个包含所有正整数的树图（如果猜想成立的话）
 */
function main() {
    const LAYER_HEIGHT = 340;
    const TOTAL_LAYER = 22;
    const LAYER_WIDTH = 900;

    // 新建一个图谱
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    function genNode(num, preNode, ita, left = false) {
        let node = new VNode();
        node.components["physics_node"]["fixPosition"] = false;
        node.components["exterior_node"]["sizeAuto"] = false;
        node.components["exterior_node"]["size"] = { x: Math.max(Math.log10(num) * 11, 12), y: 10 };
        node.components["exterior_node"]["strokeWidth"] = 0;
        node.components["exterior_node"]["bgColor"] = `rgb(${Math.sin(Math.sqrt(Math.sqrt(num))) * 125 + 125},100,${255 - (Math.sin(Math.sqrt(Math.sqrt(num))) * 125 + 125)})`;
        node.addComponent("text_node");
        node.components["text_node"]["showText"] = num.toString();
        node.y = ita * LAYER_HEIGHT;
        if (left)
            node.x = preNode.x + ((Math.random() * LAYER_WIDTH)) * (1.4 - ita / TOTAL_LAYER) ** 2;
        else
            node.x = preNode.x + ((Math.random() * LAYER_WIDTH) - LAYER_WIDTH / 2) * (1.4 - ita / TOTAL_LAYER) ** 2;
        return node;
    }

    function genEdge(from, to) {
        let edge = new VEdge(from, to);
        // edge.components["exterior_edge"]["strokeType"] = "bezierV";
        edge.components["exterior_edge"]["strokeWidth"] = 1.1;
        edge.components["physics_edge"]["linkDistance"] = Math.sqrt((from.x - to.x) ** 2 + (from.y - to.y) ** 2);
        // edge.components["physics_edge"]["linkDistance"] = 340;
        edge.components["physics_edge"]["linkStrength"] = 2;
        return edge;
    }

    function backCollatz(preNode, ita) {
        if (ita == 0) {
            return;
        } else {
            // 从上一个节点读取数值
            let num = preNode.components["text_node"]["showText"];

            // 递归层数控制
            let nita = ita - 1;

            let treeRight = num * 2;
            let treeLeft = (num - 1) / 3;

            // 删除已经存在的数
            if (graph.nodeList.filter(node => node.components["text_node"]["showText"] == treeLeft).length == 0) {
                if (treeLeft == Math.floor(treeLeft) && treeLeft > 0) {
                    // 创建节点和关系
                    let node = genNode(treeLeft, preNode, ita, true);
                    graph.addNode(node);
                    let edge = genEdge(preNode, node);
                    edge.components["exterior_edge"]["strokeColor"] = "#ea5353";
                    graph.addEdge(edge);

                    backCollatz(node, nita);
                }
            }
            if (graph.nodeList.filter(node => node.components["text_node"]["showText"] == treeRight).length == 0) {
                // 创建节点和关系
                let node = genNode(treeRight, preNode, ita, false);
                graph.addNode(node);
                let edge = genEdge(preNode, node);
                edge.components["exterior_edge"]["strokeColor"] = "#53b7ea";
                graph.addEdge(edge);

                backCollatz(node, nita);
            }
        }
    }

    let node = new VNode();
    node.components["physics_node"]["fixPosition"] = false;
    node.addComponent("text_node");
    node.components["text_node"]["showText"] = "1";
    node.y = LAYER_HEIGHT * TOTAL_LAYER;
    node.x = 0;
    graph.addNode(node);


    backCollatz(node, TOTAL_LAYER - 1);

    return graph;
}