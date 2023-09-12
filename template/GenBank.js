let rawGen = `TCGAAAGGTGTTTACATAAGCCCAAAAATTCTACCAGCTTTTGGTACGGTGCGTCATAGCACACATAAATGTTGCGAGTCATTGGATAGATATTGTGAGTCATAGCATGCATTTGTGTTGCCTAAAAATTCAACTACATGAAAAGAAACAAAACATAAATGTGATTTTGAAAGATGATTTATCAACTTTCCTTATCCATGCAAGCTACCTTCCACTGCATAACCACTTCTTTTAGATAAAAATAGCAGATCGATATACAAACGTCTACACTTCTGTAAACAGTACCCAAAAGCCAGAATTAGGATTGAACTGATTACGTGGCTTTAGCAGACCGTCCAAAAATCTGTTTTGCAAAGCTCCAATTGCTCCTTGCTTATCCAGCTTCTTTTGTGTTGGCAAATTGCTCTTTTACAACTGACTTTATTCTTCTTGTGTTTCTTAGGCTGAACTAACATCACCGTACACACAACCATTGTCATGAACCTTCACCACGTCCCTATAAAAGCCCAA`;

const colorList = [
    "#757761",
    "#F4E76E",
    "#8FF7A7",
    "#51BBFE"
];

const genList = ["A", "T", "C", "G"];
const genToList = ["T", "A", "G", "C"];

function bind() {
    bindData("gen", "基因组", rawGen.split(""));
}

function main() {
    let graph = new VGraph({
        bgColor: "#222222"
    });

    let pnode1 = null;
    let pnode2 = null;

    for (let i = 0; i < gen.length; i++) {
        let node1 = new VNode();
        node1.components["physics_node"]["fixPosition"] = true;
        node1.components["exterior_node"]["sizeAuto"] = false;
        node1.components["exterior_node"]["size"] = {
            x: 50,
            y: 50
        };
        node1.components["exterior_node"]["strokeWidth"] = 0;
        node1.components["exterior_node"]["bgColor"] = colorList[genList.indexOf(gen[i])];
        node1.components["exterior_node"]["shape"] = "rect";
        node1.components["exterior_node"]["round"] = 5;

        node1.x = Math.sin(i / 4) * 140 + Math.random() * 10;
        node1.y = i * 75 + Math.random() * 10;

        node1.addComponent("text_node");
        node1.components["text_node"]["showText"] = gen[i];
        node1.components["text_node"]["textColor"] = "#ffffff";

        graph.addNode(node1);

        let node2 = new VNode();
        let genCode = genToList[genList.indexOf(gen[i])];
        node2.components["physics_node"]["fixPosition"] = true;
        node2.components["exterior_node"]["sizeAuto"] = false;
        node2.components["exterior_node"]["size"] = {
            x: 50,
            y: 50
        };
        node2.components["exterior_node"]["strokeWidth"] = 0;
        node2.components["exterior_node"]["bgColor"] = colorList[genList.indexOf(genCode)];
        node2.components["exterior_node"]["shape"] = "rect";
        node2.components["exterior_node"]["round"] = 5;

        node2.x = Math.sin(i / 4 - Math.PI) * 140 + Math.random() * 10;
        node2.y = i * 75 + Math.random() * 10;

        node2.addComponent("text_node");
        node2.components["text_node"]["showText"] = genCode;
        node2.components["text_node"]["textColor"] = "#ffffff";

        graph.addNode(node2);

        let edge = new VEdge(node1, node2);
        edge.components["exterior_edge"]["strokeWidth"] = 5;
        graph.addEdge(edge);

        if (pnode1) {
            let edge1 = new VEdge(pnode1, node1);
            graph.addEdge(edge1);
        }
        if (pnode2) {
            let edge2 = new VEdge(pnode2, node2);
            graph.addEdge(edge2);
        }

        pnode1 = node1;
        pnode2 = node2;
    }

    return graph;
}