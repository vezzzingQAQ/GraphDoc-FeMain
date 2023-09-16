function bind() {
    bindData("oreo", "奥利奥", "奥利奥", "数据格式:奥利奥奥利奥奥利奥");
}

function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    for (let i = 0; i < oreo.length; i++) {
        if (oreo[oreo.length - 1 - i] == "奥") {
            for (let j = 0; j < 5; j++) {
                let node = new VNode();
                node.components["physics_node"]["fixPosition"] = true;
                node.components["exterior_node"]["sizeAuto"] = false;
                node.components["exterior_node"]["shape"] = "rect";
                node.components["exterior_node"]["round"] = 500;
                node.components["exterior_node"]["size"] = {
                    x: 150,
                    y: 61
                };
                node.components["exterior_node"]["strokeWidth"] = 0;
                node.components["exterior_node"]["bgColor"] = "#111111";
                node.y = 500 - i * 25 + j * 5;
                node.x = 300;
                graph.addNode(node);
            }
        } else {
            for (let j = 0; j < 5; j++) {
                let node = new VNode();
                node.components["physics_node"]["fixPosition"] = true;
                node.components["exterior_node"]["sizeAuto"] = false;
                node.components["exterior_node"]["shape"] = "rect";
                node.components["exterior_node"]["round"] = 500;
                node.components["exterior_node"]["size"] = {
                    x: 145,
                    y: 61
                };
                node.components["exterior_node"]["strokeWidth"] = 0;
                node.components["exterior_node"]["bgColor"] = "#dddddd";
                node.y = 500 - i * 25 + j * 5;
                node.x = 300;
                graph.addNode(node);
            }
        }
    }

    return graph;
}