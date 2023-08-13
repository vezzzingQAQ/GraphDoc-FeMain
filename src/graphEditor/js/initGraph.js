/**
 * 初始化graphEditor的SVG绘图
 * by vezzzing 2023.8.3
 * z z z studio
 */

import { CreateBasicEdge, CreateBasicNode, CreateLinkNode } from "./graph/element";
import { LoadGraphFromJson, Graph } from "./graph/graph";

/**
 * 根据储存的数据对象绘制图表
 * @param {object} graphObj 文档储存JSON对象
 * @returns 返回创建的Graph对象
 */
export function initGraph(graphObj) {
    // let graph = new Graph();
    // let centerNode = CreateBasicNode();
    // graph.addNode(centerNode);
    // let pNode = null;
    // for (let i = 0; i < 2; i++) {
    //     let addedNodeLink = CreateLinkNode();
    //     graph.addNode(addedNodeLink);
    //     let addedEdge = CreateBasicEdge(centerNode, addedNodeLink);
    //     graph.addEdge(addedEdge);
    //     if (pNode) {
    //         let addedEdge2 = CreateBasicEdge(pNode, addedNodeLink);
    //         graph.addEdge(addedEdge2);
    //     }
    //     pNode = addedNodeLink;
    // }

    let graph = LoadGraphFromJson(JSON.parse(`
{"nodeList":[{"uuid":"zznodec84cd1c7b8ca41589a1a6f6b5f7ce7af","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5}},"vx":-0.0038927804657350367,"vy":0.0001524445049209648,"x":850.6100896697938,"y":709.5656852912526},{"uuid":"zznode4665f41041df43cf9f8d48693ccf3120","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5},"link_node":{"url":"http://vezzzing.cn/vezzzingsLibrary/dist/main.html","openOuter":true}},"vx":0.002691832336481154,"vy":-0.0012941434221843237,"x":509.67471380510443,"y":920.0633087211033},{"uuid":"zznode169ea1c85ee64e559348fcea4c383d1a","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5},"link_node":{"url":"http://vezzzing.cn/vezzzingsLibrary/dist/main.html","openOuter":true}},"vx":-0.004960441644908862,"vy":-0.0020265156621095733,"x":499.1824771863155,"y":520.2785054786407},{"uuid":"zznode5ef0365378b24722bd7869923f8b7da1","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5},"audio_node":{"soundVolume":1}},"vx":0.009079223622035787,"vy":-0.09424615332315796,"x":856.7094832289727,"y":843.1240881361407},{"uuid":"zznode8f5867baf4e1459e811ca69ac99f3cf4","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.00010851238907193101,"vy":0.0017831496956747777,"x":748.0813664887017,"y":414.52377415192416},{"uuid":"zznode3e9c212b9fd14f39bfb0a1ab0e512755","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.0010307115283113668,"vy":0.00002377905518249232,"x":398.71524100423557,"y":220.10398325121017},{"uuid":"zznode64357c7a316642f2997b6fff3fbf6daa","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"rect","dividerColor":null,"bgColor":"#292929","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ\\n2333\\n14155","textColor":"#f5ff70","textSize":4,"textSpacing":0,"textWeight":5},"audio_node":{"soundVolume":1}},"vx":0.0005759478151150847,"vy":-0.003828512886905189,"x":792.2332398497207,"y":293.69305269250884},{"uuid":"zznode9bacbc5fe57e4eefa18d38793767389b","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.0023953358126965496,"vy":-0.0030595149347113822,"x":642.349399989787,"y":-75.89584143346005},{"uuid":"zznodeb3e34ede2fcf40cc9fc2661da726cb81","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.003964739789971165,"vy":-0.002894550771288655,"x":535.567480829619,"y":310.21297949812265},{"uuid":"zznode2fb9bd1904c44f00973db71f00111cff","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":5.581539774581376e-14,"vy":-1.3131377773785106e-13,"x":1013.6452753449794,"y":491.5071457821525},{"uuid":"zznode69d4f874e5ee4358a518fca14988049f","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.014319630803762392,"vy":-0.02080843539999128,"x":827.3736548854303,"y":758.196179069671},{"uuid":"zznode4dd391231d154432b7106aba04cbd172","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"rect","dividerColor":null,"bgColor":"#ffffff","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":"0"},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#000000","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.00206054512173248,"vy":0.008678147383141505,"x":900.3830448533223,"y":663.6709105441506},{"uuid":"zznodeab6913c30de74c9cbf8aa52873cc128c","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.11247730197731906,"vy":-0.06961723625469726,"x":842.3646923523639,"y":908.7631357930463},{"uuid":"zznode5bcfd28c15cc443d8c98e9addffc646f","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.002299918372512339,"vy":-0.0030844418267501187,"x":618.1726514632235,"y":204.8477504108863},{"uuid":"zznodebcfa99c4600f4245affdb5a7bf66d233","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.0005946424739001787,"vy":0.003825816863052994,"x":680.9611964625711,"y":539.9196436330635},{"uuid":"zznode60a4408d8de54ba8ba74ac4bf132ddba","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.04745627377600264,"vy":-0.013225691228014924,"x":729.4711700841838,"y":925.527784059481},{"uuid":"zznodecfcc3ef286aa42d982f5b9deaf34ea92","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.024532747949959452,"vy":-0.04878651438794404,"x":742.854974423225,"y":805.0794652139928},{"uuid":"zznode60adb6b1789e4b26bf9ba92c97cad3c6","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.04495812510257256,"vy":-0.006629521536337263,"x":731.551458369121,"y":863.9700580813806},{"uuid":"zznodebfb7b5666855473cb01525788d3d519d","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":-0.010445846178981468,"vy":-0.0630271514242455,"x":766.2302207694725,"y":749.8605676463499},{"uuid":"zznodedf62b249fa75441c91768207c7abc2b9","components":{"exterior_node":{"size":{"x":10,"y":1},"sizeAuto":true,"shape":"circle","dividerColor":null,"bgColor":"#000f00","dividerStroke":null,"strokeColor":"#ffd500","strokeStyle":"0","strokeWidth":0.5},"physics_node":{"dividerCollision":null,"collisionRadius":10,"collisionRadiusAuto":true,"dividerManyBodyForce":null,"manyBodyForceStrength":80,"manyBodyForceRangeMin":10,"manyBodyForceRangeMax":112},"scaleHover_node":{"scale":1.2,"scaleTime":0.5},"text_node":{"showText":"VEZZ","textColor":"#ffffff","textSize":4,"textSpacing":0,"textWeight":5}},"vx":0.020629402526708064,"vy":0.041725639940791565,"x":785.0779119023706,"y":891.0792069768606}],"edgeList":[{"uuid":"zzedge0f65bb148084419ab3775a6fa3ced58b","source":"zznodec84cd1c7b8ca41589a1a6f6b5f7ce7af","target":"zznode4665f41041df43cf9f8d48693ccf3120","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge1aa9b884dfbc48129a146674923d53e3","source":"zznodec84cd1c7b8ca41589a1a6f6b5f7ce7af","target":"zznode169ea1c85ee64e559348fcea4c383d1a","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge87dbdb15569347de877a6868ebbf1b54","source":"zznode4665f41041df43cf9f8d48693ccf3120","target":"zznode169ea1c85ee64e559348fcea4c383d1a","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedgea6947f3de1a5445b83583f4e6f9c3307","source":"zznode8f5867baf4e1459e811ca69ac99f3cf4","target":"zznode3e9c212b9fd14f39bfb0a1ab0e512755","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge3adfec963d5f46b7807f6c24d6ce2928","source":"zznode3e9c212b9fd14f39bfb0a1ab0e512755","target":"zznode64357c7a316642f2997b6fff3fbf6daa","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge77462fbf406d4c17a98e19c675c71cde","source":"zznode64357c7a316642f2997b6fff3fbf6daa","target":"zznode9bacbc5fe57e4eefa18d38793767389b","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedgef2399d1a0bde4639afecb3ede7055c92","source":"zznode9bacbc5fe57e4eefa18d38793767389b","target":"zznodeb3e34ede2fcf40cc9fc2661da726cb81","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":400},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge04fbe81e535f41dba8fd0b8d10fd2910","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznode69d4f874e5ee4358a518fca14988049f","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":96.44478744695583},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge56888ca3585645ffaffa40ac194a5b27","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznode4dd391231d154432b7106aba04cbd172","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":53.134002044602255},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge9a24876f52e644f78b4d35f2be773967","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznodeab6913c30de74c9cbf8aa52873cc128c","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":52.47233088863493},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge33e0c181aee749f88a9fb75ce97475e9","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznode60a4408d8de54ba8ba74ac4bf132ddba","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":144.76006420868006},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedge88879945301e48339fd5be6e362a1194","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznodecfcc3ef286aa42d982f5b9deaf34ea92","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":123.13451743466469},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedgee49aaefdc09a4ba88bcd95222d8dab82","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznode60adb6b1789e4b26bf9ba92c97cad3c6","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":105.25859330293493},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedgec9da5db60cfd4182a75f04cb099b420e","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznodebfb7b5666855473cb01525788d3d519d","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":132.6941018443761},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}},{"uuid":"zzedgeee1b08f32c8a41beb3c77010f5afd508","source":"zznode5ef0365378b24722bd7869923f8b7da1","target":"zznodedf62b249fa75441c91768207c7abc2b9","components":{"exterior_edge":{"strokeColor":"#666666","strokeStyle":"dot","strokeWidth":0.6},"physics_edge":{"linkStrength":0.8,"linkDistance":89.56152129540708},"scaleHover_edge":{"scale":11,"scaleTime":0.5}}}]}
    `));
    
    graph.render();
    return graph;
}