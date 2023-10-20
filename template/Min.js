// minimum.js

function main(){
    let graph=new VGraph({bgColor:"#ffffff"});
    let node1=new VNode();
    node1.addComponent("text_node");
    node1.components["text_node"]["showText"]="2333";
    node1.x=100;
    node1.y=100;
    let node2=new VNode();
    node2.x=200;
    node2.y=200;
    let edge=new VEdge(node1,node2);
    graph.addNode(node1);
    graph.addNode(node2);
    graph.addEdge(edge);
    return graph;
}