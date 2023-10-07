function bind() {
    bindData("doc", "VGD文件", "", "打开一个VGD文件来生成", "vgd");
    bindData("filterWords", "过滤关键词", "图片,链接,null,undefined,style,公式,装饰节点,center", "不想要呈现的关键词", "text");
}

function main() {
    let graph = new VGraph({
        bgColor: "#ffffff"
    });

    if (!doc) {
        return graph;
    }

    let nodeList = doc.nodeList;

    let tagList = [];

    for (let node of nodeList) {
        if (node.components["tag_node"]) {
            for (let tag of node.components["tag_node"].tags) {
                tagList.push(tag);
            }
        }
    }

    function getRepeatNum(arr) {
        var obj = {};
        for (var i = 0, l = arr.length; i < l; i++) {
            var item = arr[i];
            obj[item] = (obj[item] + 1) || 1;
        }
        return obj;
    }

    let orderedList = getRepeatNum(tagList);

    let keyOrder = [];
    for (let key in orderedList) {
        let repeatNum = orderedList[key];
        keyOrder.push({
            key: key,
            num: repeatNum
        });
    }

    keyOrder = keyOrder.sort((a, b) => {
        return b.num - a.num;
    });

    // 过滤掉不要的关键词
    let filterList = filterWords.split(",");
    console.log(filterList);
    keyOrder = keyOrder.filter(tagObj => {
        return !filterList.includes(tagObj.key);
    })

    // 生成词云
    for (let i = 0; i < keyOrder.length; i++) {
        let currentTag = keyOrder[i];
        let node = new VNode();
        node.components["physics_node"]["fixPosition"] = false;
        node.components["exterior_node"]["opacity"] = 0;
        node.components["exterior_node"]["sizeAuto"] = false;
        node.components["exterior_node"]["size"] = {
            x: Math.floor((currentTag.num + 12) * currentTag.num * 0.5),
            y: Math.floor((currentTag.num + 12) * currentTag.num * 0.5)
        };

        node.x = Math.random() * 100;
        node.y = Math.random() * 100;

        node.addComponent("text_node");
        node.components["text_node"]["showText"] = currentTag.key;
        node.components["text_node"]["textColor"] = "#222222";
        node.components["text_node"]["textSize"] = Math.floor((currentTag.num + 12) * currentTag.num * 0.5);

        graph.addNode(node);
    }

    return graph;
}