import * as d3 from "d3";

/**
 * ▶ 根据储存的数据对象绘制图表
 * @param {object} storeObj 储存对象
 */
export function initGraph(nodeList, edgeList) {

    // 创建需要添加的力
    const linkForces = d3.forceLink()
        .links(edgeList)
        .distance(d => d.forceLen);

    const centerForce = d3.forceCenter()
        .x(window.innerWidth / 2)
        .y(window.innerHeight / 2)
        .strength(1.3);

    const chargeForce = d3.forceManyBody()
        .strength(-80)
        .distanceMax(200)
        .distanceMin(10);

    const collideForce = d3.forceCollide()
        .radius(d => d.radius);

    // 创建物理模拟
    const simulation = d3.forceSimulation(nodeList)
        .force("link", linkForces)
        .force("center", centerForce)
        .force("charge", chargeForce)
        .force("collide", collideForce)
        .alphaDecay(0.08);

    // 创建画布
    const svg = d3.select(".displayArea").append("svg")
        .attr("width", window.innerWidth)
        .attr("height", window.innerHeight);

    // 创建绘画区域
    const viewGraph = svg.append("g")
        .attr("class", "viewGraph");

    // 添加NODE和EDGE
    const edges = viewGraph.selectAll(".forceLine")
        .data(edgeList)
        .enter()
        .append("line")
        .attr("class", "forceLine")
        .style("stroke", "rgba(255,255,255,0.4)")
        .style("stroke-width", 0.1);

    const nodes = viewGraph.selectAll(".forceNode")
        .data(nodeList)
        .enter()
        .append("g")
        .attr("class", "forceNode")
        .call(drag(simulation));

    // 计算物理模拟
    simulation.on("tick", () => {
        edges.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        nodes.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // 缩放平移
    svg.call(d3.zoom()
        .extent([[0, 0], [window.innerWidth, window.innerHeight]])
        .scaleExtent([0.1, 20])
        .on("zoom", zoomed));

    function zoomed({ transform }) {
        viewGraph.attr("transform", transform);
    }

    // 拖动
    function drag(simulation) {

        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        return d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended);
    }
}