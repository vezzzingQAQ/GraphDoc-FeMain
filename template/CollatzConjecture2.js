function main() {
    let graph = new VGraph({
        bgColor: "#222222"
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
                x: Math.log2(num) * 10,
                y: Math.log2(num) * 10
            };
            node.components["exterior_node"]["strokeWidth"] = 0;
            node.components["exterior_node"]["bgColor"] = `rgb(${Math.sin(Math.sqrt(Math.sqrt(num))) * 125 + 125},${Math.sin(Math.log2(num)) * 125 + 125},${255 - (Math.sin(Math.sqrt(Math.sqrt(num))) * 125 + 125)})`;
            node.components["exterior_node"]["shape"] = "rect";
            node.components["exterior_node"]["round"] = 5;

            node.addComponent("text_node");
            node.components["text_node"]["showText"] = num.toString();

            node.cx = index * 50;
            node.cy = i * 50;

            graph.addNode(node);

            if (num % 2 == 0) {
                num = num / 2;
            } else {
                num = num * 3 + 1;
            }
        }
    }

    return graph;
}