function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    for (let i = 5; i < 50; i++) {
        let index = 0;
        let num = i;
        while (num != 1) {
            index++;

            // 绘制节点
            let node = new VNode();
            node.components["exterior_node"]["sizeAuto"] = false;
            node.components["exterior_node"]["size"] = {
                x: Math.min(Math.log2(num) * 10 + 2, 50),
                y: Math.min(Math.log2(num) * 10 + 2, 50)
            };
            node.components["exterior_node"]["strokeWidth"] = 0;
            node.components["exterior_node"]["bgColor"] = `rgb(
                ${Math.sin(Math.sqrt(Math.sqrt(num))) * 125 + 125},
                ${255 - (Math.sin(Math.log2(num)) * 125 + 125)},
                ${120}
            )`;
            node.components["exterior_node"]["shape"] = "rect";
            node.components["exterior_node"]["round"] = 5;

            node.addComponent("text_node");
            node.components["text_node"]["showText"] = num.toString();

            node.x = index * 50;
            node.y = i * 50;

            graph.addNode(node);

            if (num % 2 == 0) {
                num = num / 2;
            } else {
                num = num * 3 + 1;
            }
        }

        let dispNode = new VNode();
        dispNode.components["exterior_node"]["bgColor"] = "#ffffff";
        dispNode.components["exterior_node"]["strokeWidth"] = 0;
        dispNode.components["exterior_node"]["shape"] = "rect";
        dispNode.addComponent("text_node");
        dispNode.components["text_node"]["showText"] = `<p style="font-family: 'Times New Roman', Times, serif;">当起始数字为${i}时，经过${index}次迭代，达到循环</p>`;
        dispNode.components["text_node"]["textColor"] = "#222222";
        dispNode.x = index * 50 + 150;
        dispNode.y = i * 50;
        graph.addNode(dispNode);
    }

    return graph;
}