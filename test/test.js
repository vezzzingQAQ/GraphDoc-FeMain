function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    let centerNode = new VNode();
    centerNode.components["physics_node"]["fixPosition"] = false;
    centerNode.components["exterior_node"]["sizeAuto"] = false;
    centerNode.components["exterior_node"]["size"] = { x: 20, y: 10 };
    centerNode.components["exterior_node"]["bgColor"] = `rgb(255,255,255)`;
    centerNode.components["exterior_node"]["strokeColor"] = `rgb(0,0,0)`;

    for (let i = 0; i < 800; i++) {
        let node = new VNode();
        node.components["physics_node"]["fixPosition"] = false;
        node.components["exterior_node"]["sizeAuto"] = false;
        node.components["exterior_node"]["size"] = { x: Math.random() * 8 + 2, y: 10 };
        node.components["exterior_node"]["bgColor"] = `rgb(${Math.sin(i / 200) * 125 + 125},100,${255 - Math.sin(i / 200) * 125 + 125})`;
        node.components["exterior_node"]["strokeColor"] = `rgb(0,0,0)`;
        node.x = Math.sin(i) * 500;
        node.y = Math.cos(i) * 500;
        let edge = new VEdge(node, centerNode);
        edge.components["physics_edge"]["linkDistance"] = Math.random() * 300 + 100;
        edge.components["exterior_edge"]["strokeType"] = "bezierH";
        edge.components["exterior_edge"]["strokeWidth"] = 0.2;
        graph.addNode(node);
        graph.addEdge(edge);
    }

    graph.addNode(centerNode);
    return graph;
}