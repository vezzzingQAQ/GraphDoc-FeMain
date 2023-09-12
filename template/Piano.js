const notes = [
    { value: "1", text: "钢琴C" },
    { value: "2", text: "钢琴D" },
    { value: "3", text: "钢琴E" },
    { value: "4", text: "钢琴F" },
    { value: "5", text: "钢琴G" },
    { value: "6", text: "钢琴A" },
    { value: "7", text: "钢琴B" },
    { value: "G1", text: "钢琴gC" },
    { value: "G2", text: "钢琴gD" },
    { value: "G3", text: "钢琴gE" },
    { value: "G4", text: "钢琴gF" },
    { value: "G5", text: "钢琴gG" },
    { value: "G6", text: "钢琴gA" },
    { value: "G7", text: "钢琴gB" },
    { value: "GG1", text: "钢琴ggC" },
    { value: "GG2", text: "钢琴ggD" },
    { value: "GG3", text: "钢琴ggE" }
];

function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < notes.length; j++) {
            let node = new VNode();
            node.components["exterior_node"]["sizeAuto"] = false;
            node.components["exterior_node"]["size"] = {
                x: 50,
                y: 50
            };
            node.components["exterior_node"]["shape"] = "rect";
            node.components["exterior_node"]["round"] = 5;
            node.components["exterior_node"]["strokeWidth"] = 0;
            node.components["exterior_node"]["bgColor"] = `rgb(
                ${i * 25},
                ${Math.sin(j / 4) * 125 + 125},
                ${120}
            )`;

            node.addComponent("text_node");
            node.components["text_node"]["showText"] = notes[j].value;

            node.addComponent("audio_node");
            node.components["audio_node"]["soundType"] = notes[j].value;
            node.components["audio_node"]["soundVolume"] = (10 - i) / 10;

            node.addComponent("scaleHover_node");

            node.x = j * 75;
            node.y = i * 75;

            graph.addNode(node);
        }
    }

    return graph;
}