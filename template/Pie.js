const PIE = "1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632788659361533818279682303019520353018529689957736225994138912497217752834791315155748572424541506959508295331168617278558890750983817546374649393192550604009277016711390098488240128583616035637076601047101819429555961989467678374494482553797747268471040475346462080466842590694912933136770289891521047521620569660240580381501935112533824300355876402474964732639141992726042699227967823547816360093417216412199245863150302861829745557067498385054945885869269956909272107975093029553211653449872027559602364806654991198818347977535663698074265425278625518184175746728909777727938000";

const color = [
    "#ff205b",
    "#f304df",
    "#00835a",
    "#02f9f1",
    "#ff5500",
    "#8400ff",
    "#0e97ff",
    "#0011ff",
    "#08a208",
    "#098b82"
]

const note = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "G1",
    "G2",
    "G3"
]

function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    for (let i = 0; i < 40; i++) {
        for (let j = 0; j < 40; j++) {
            let index = i * 40 + j;
            let char = PIE[index];
            // 添加节点
            let node = new VNode();
            node.components["physics_node"]["fixPosition"] = true;
            node.components["exterior_node"]["sizeAuto"] = false;
            node.components["exterior_node"]["size"] = { x: Math.floor(char) * 2 + 10, y: 10 };
            node.components["exterior_node"]["strokeWidth"] = 0;
            node.components["exterior_node"]["bgColor"] = color[9 - Math.floor(char)];

            node.addComponent("text_node");
            node.components["text_node"]["showText"] = char;
            node.components["text_node"]["textColor"] = "#ffffff";

            node.addComponent("audio_node");
            node.components["audio_node"]["soundType"] = note[Math.floor(char) - 1];

            node.addComponent("scaleHover_node");

            node.cx = j * 50;
            node.cy = i * 50;
            node.x = j * 50;
            node.y = i * 50;

            graph.addNode(node);
        }
    }

    return graph;
}