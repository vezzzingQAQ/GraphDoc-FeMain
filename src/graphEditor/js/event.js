/**
 * 用来提供各种事件
 * by vezzzing 2023.8.23
 * z z z studio
 */

import axios from "axios";
import { saveAs } from 'file-saver';
import { EDITOR_PGAE, GRAPH_SVG_UPLOAD_PATH, USER_AVATAR_ROOT, USER_DATA, USER_LOGIN, USER_REGISTER, GRAPH_PNG_STORE_PATH, USER_PAGE, AVATAR_STORE_PATH, DOMAIN_FE } from "../../public/js/urls";
import { delCookie, getCookie, getQueryVariable, setCookie } from "../../public/js/tools";
import { configGraph, deleteGraph, getUserData, listUserGraph, loadGraphConfig, loadGraphFromCloud, saveGraphToCloud } from "../../public/js/serverCom";
import defaultAvatarPng from "./../../asset/img/defaultAvatar.png";
import newGraphJson from "./../../asset/graph/new.json";

const templateList = [
    {
        showName: "关系图",
        name: "centerGraph",
    },
    {
        showName: "图谱",
        name: "graph",
    },
    {
        showName: "钢琴",
        name: "piano",
    },
    {
        showName: "考拉兹猜想",
        name: "cc1",
    },
    {
        showName: "圆周率",
        name: "pie",
    },
    {
        showName: "中国行政区划",
        name: "cdc",
    },
];

const templateDyaList = [
    {
        showName: "碱基对",
        name: "gen1",
    },
    {
        showName: "年份图",
        name: "dyaData",
    },
    {
        showName: "CE图",
        name: "centerGraphDya",
    },
    {
        showName: "奥利奥",
        name: "oreo",
    },
    {
        showName: "格式化文本1",
        name: "blockText",
    }
]

const addNodeList = [
    {
        showName: "THEME1-基本节点",
        name: "basicNode",
        nodeString: `[{\"uuid\":\"zznode5fce92bb815d46bdb08fdba48c9232ab\",\"components\":{\"exterior_node\":{\"size\":{\"x\":\"50\",\"y\":\"50\"},\"sizeAuto\":false,\"rotate\":0,\"scale\":1,\"round\":\"3\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#7d7d7d\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":1},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"tag_node\":{\"tags\":[]}},\"vx\":0,\"vy\":0,\"x\":527.0015162736321,\"y\":175.00199834396233,\"cx\":527.0015162736321,\"cy\":175.00199834396233}]`
    },
    {
        showName: "THEME1-文本节点",
        name: "textNode",
        nodeString: `[{\"uuid\":\"zznode09033a8888a84d4abb0e31c62f781740\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击输入文本\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":\"12\",\"textSpacing\":0,\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":513.000875308945,\"y\":257.0073881942305,\"cx\":513.000875308945,\"cy\":257.0073881942305}]`
    },
    {
        showName: "THEME1-图片节点",
        name: "imgNode",
        nodeString: `[{\"uuid\":\"zznode2ea1771a99f946b9ac3d5aea05dc90ea\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4f4f4f\",\"dividerStroke\":null,\"strokeColor\":\"#ababab\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"img_node\":{\"path\":\"c4b37798bf1d7be72a839f663536340_189343.jpg\",\"width\":\"50\"}},\"vx\":0,\"vy\":0,\"x\":830,\"y\":1150,\"cx\":830,\"cy\":1150}]`
    },
    {
        showName: "THEME1-代码节点",
        name: "codeNode",
        nodeString: `[{\"uuid\":\"zznode31af7649e7e74d35b70e00356384a3d1\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4f4f4f\",\"dividerStroke\":null,\"strokeColor\":\"#ababab\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"code_node\":{\"content\":\"void main()\\n{\\n  print(\\\"vezz\\\");\\n}\"}},\"vx\":0,\"vy\":0,\"x\":400,\"y\":1170,\"cx\":400,\"cy\":1170}]`
    },
    {
        showName: "THEME1-大标题",
        name: "mainTitle",
        nodeString: `[{\"uuid\":\"zznodea8da78876fa44fdebcb4be52a3b3878f\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"大标题\",\"textColor\":\"#ffffff\",\"textFont\":\"'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif\",\"textSize\":\"43\",\"textSpacing\":\"2\",\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":995.2551945338789,\"y\":267.678045336371,\"cx\":995.2551945338789,\"cy\":267.678045336371}]`
    },
    {
        showName: "THEME1-二级标题",
        name: "subTitle",
        nodeString: `[{\"uuid\":\"zznodebcb2759d47ff404f813236302652ea26\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"二级标题\",\"textColor\":\"#ffffff\",\"textFont\":\"'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif\",\"textSize\":\"25\",\"textSpacing\":\"2\",\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":1295.7432925411065,\"y\":218.4163803645765,\"cx\":1295.7432925411065,\"cy\":218.4163803645765}]`
    },
    {
        showName: "THEME1-三级标题",
        name: "thirdTitle",
        nodeString: `[{\"uuid\":\"zznodec41d8a17d73c4f88ad938aff57511c90\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"3\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"三级标题\",\"textColor\":\"#ffffff\",\"textFont\":\"'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif\",\"textSize\":\"17\",\"textSpacing\":\"0\",\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":1336.9187711200038,\"y\":332.92370430768125,\"cx\":1336.9187711200038,\"cy\":332.92370430768125}]`
    },
    {
        showName: "THEME1-带物理的球",
        name: "physicsCircle",
        nodeString: `[{\"uuid\":\"zznodefff61927fc594203a0cc03abcd542b0c\",\"components\":{\"exterior_node\":{\"size\":{\"x\":\"50\",\"y\":\"50\"},\"sizeAuto\":false,\"rotate\":0,\"scale\":1,\"round\":\"3\",\"shape\":\"circle\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#7d7d7d\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":1},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":false},\"tag_node\":{\"tags\":[]}},\"vx\":0,\"vy\":0,\"x\":1043.0721448651723,\"y\":273.94929186700404,\"cx\":1043.0721448651723,\"cy\":273.94929186700404}]`
    },
    {
        showName: "THEME1-黑色小块块",
        name: "blackBlock",
        nodeString: `[{\"uuid\":\"zznodec0af3010b7ac47c78a3e54e0a7249a72\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":null,\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#000f00\",\"dividerStroke\":null,\"strokeColor\":\"#000000\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":false,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击输入文字\",\"textColor\":\"#ffffff\",\"textFont\":null,\"textSize\":12,\"textSpacing\":0,\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":279.0078503190116,\"y\":889.0014288102573,\"cx\":279.0078503190116,\"cy\":889.0014288102573}]`
    },
    {
        showName: "THEME1-黑色小块块",
        name: "whiteBlock",
        nodeString: `[{\"uuid\":\"zznodedf282d490cae46508c9c4bc2e162298a\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"3\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#ffffff\",\"dividerStroke\":null,\"strokeColor\":\"#000000\",\"strokeStyle\":\"0\",\"strokeWidth\":\"1\",\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":false,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击输入文字\",\"textColor\":\"#3b3b3b\",\"textFont\":null,\"textSize\":\"12\",\"textSpacing\":0,\"textWeight\":5}},\"vx\":0,\"vy\":0,\"x\":354.50554328165146,\"y\":50.6152804502658,\"cx\":354.50554328165146,\"cy\":50.6152804502658}]`
    },
    {
        showName: "THEME1-中心圈圈",
        name: "circleCenter",
        nodeString: `[{\"uuid\":\"zznodeb52917d8d09f48b8aa4d36e426e30e48\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":null,\"shape\":\"circle\",\"dividerColor\":null,\"bgColor\":\"#5e5e5e\",\"dividerStroke\":null,\"strokeColor\":\"#000000\",\"strokeStyle\":\"0\",\"strokeWidth\":\"0\",\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"GraphDoc\",\"textColor\":\"#ffffff\",\"textFont\":\"'Times New Roman', Times, serif\",\"textSize\":\"33\",\"textSpacing\":0,\"textWeight\":5},\"tag_node\":{\"tags\":[\"center\"]}},\"vx\":0,\"vy\":0,\"x\":720,\"y\":430,\"cx\":720,\"cy\":430}]`
    },
    {
        showName: "中心节点",
        name: "mainCenter2",
        nodeString: `[{\"uuid\":\"zznode176f06893465495d81296b8d86a9ee82\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击编辑文字\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":\"33\",\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"background:linear-gradient(to right,rgb(100,100,200),rgb(10,150,200));\\nborder-radius:5px;\\npadding:10px;\\ntext-shadow: 2px 2px 4px #000000;\"}},\"vx\":0,\"vy\":0,\"x\":238.73768968917716,\"y\":465.8087704277939,\"cx\":238.73768968917716,\"cy\":465.8087704277939}]`
    },
    {
        showName: "毛玻璃效果",
        name: "glass1",
        nodeString: `[{\"uuid\":\"zznode02f4a7ac46a94169bd0ffdf8fd27021c\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击编辑文字\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":\"33\",\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"background:rgba(0,0,0,0.2);\\nborder-radius:5px;\\npadding:10px;\\nbackdrop-filter:blur(2px);\"}},\"vx\":0,\"vy\":0,\"x\":348.2864239713068,\"y\":706.9979625330783,\"cx\":348.2864239713068,\"cy\":706.9979625330783}]`
    },
    {
        showName: "发光文字",
        name: "textShadow1",
        nodeString: `[{\"uuid\":\"zznode8cb9af4826ce4b56acc303d595c9a67e\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击编辑文字\",\"textColor\":\"#ffffff\",\"textFont\":null,\"textSize\":\"33\",\"textSpacing\":0,\"textWeight\":\"1\"},\"css_node\":{\"content\":\"text-shadow: 0 0 3px rgba(250,250,250,1);\"}},\"vx\":0,\"vy\":0,\"x\":1096.8509069511992,\"y\":680.6208863492665,\"cx\":1096.8509069511992,\"cy\":680.6208863492665}]`
    },
    {
        showName: "图片滤镜-去色",
        name: "filter1",
        nodeString: `[{\"uuid\":\"zznode35dc49c5a15048cdb276252759739f45\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4f4f4f\",\"dividerStroke\":null,\"strokeColor\":\"#ababab\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"img_node\":{\"path\":\"c4b37798bf1d7be72a839f663536340_189343.jpg\",\"width\":\"50\"},\"css_node\":{\"content\":\"filter:grayscale(1);\"}},\"vx\":0,\"vy\":0,\"x\":1141.849142014348,\"y\":914.4217347693485,\"cx\":1141.849142014348,\"cy\":914.4217347693485}]`
    },
    {
        showName: "图片滤镜-提纯",
        name: "filter2",
        nodeString: `[{\"uuid\":\"zznode35dc49c5a15048cdb276252759739f45\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"5\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4f4f4f\",\"dividerStroke\":null,\"strokeColor\":\"#ababab\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"img_node\":{\"path\":\"c4b37798bf1d7be72a839f663536340_189343.jpg\",\"width\":\"50\"},\"css_node\":{\"content\":\"filter:contrast(2);\"}},\"vx\":0,\"vy\":0,\"x\":1141.849142014348,\"y\":914.4217347693485,\"cx\":1141.849142014348,\"cy\":914.4217347693485}]`
    },
    {
        showName: "竖排显示文字",
        name: "vertical1",
        nodeString: `[{\"uuid\":\"zznodef618f9a0bdf94adfb138c98a45ea35cf\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"2\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":null},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击添加文字\\n这里会竖排显示文字\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":4,\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"writing-mode:vertical-lr;\"}},\"vx\":0,\"vy\":0,\"x\":674.5916137695312,\"y\":47.41063690185547,\"cx\":674.5916137695312,\"cy\":47.41063690185547}]`
    },
    {
        showName: "竖排毛玻璃",
        name: "verticalGlass1",
        nodeString: `[{\"uuid\":\"zznode97a277eb3a384c4db1e7a883ea0f861f\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"2\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"双击添加文字\\n这里会竖排显示文字\\n2333\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":4,\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"writing-mode:vertical-lr;\\nbackground:linear-gradient(to bottom,rgb(100,100,200),rgba(10,150,200,0.5));\\nborder-radius:5px;\\npadding:10px;\\nbackdrop-filter:blur(2px);\\nborder:0.4px solid rgba(255,255,255,0.5);\"}},\"vx\":0,\"vy\":0,\"x\":-224.89585300431554,\"y\":613.6181977826884,\"cx\":-224.89585300431554,\"cy\":613.6181977826884}]`
    },
    {
        showName: "居中对齐",
        name: "alignCenter1",
        nodeString: `[{\"uuid\":\"zznodef618f9a0bdf94adfb138c98a45ea35cf\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"2\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#999999\",\"strokeStyle\":\"0\",\"strokeWidth\":0.5,\"opacity\":\"0\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"静夜思\\n李白\\n床前明月光，\\n疑似地上霜。\\n举头望明月，\\n低头思故乡。\",\"textColor\":\"#bfbfbf\",\"textFont\":\"'Times New Roman', Times, serif\",\"textSize\":4,\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"text-align:center;\"}},\"vx\":0,\"vy\":0,\"x\":361.57469122327063,\"y\":647.5565281612973,\"cx\":361.57469122327063,\"cy\":647.5565281612973}]`
    },
    {
        showName: "下划线",
        name: "borderBottom1",
        nodeString: `[{\"uuid\":\"zznodef6b383c429b342a897f6121c85a6d9a5\",\"components\":{\"exterior_node\":{\"size\":{\"x\":10,\"y\":1},\"sizeAuto\":true,\"rotate\":null,\"scale\":null,\"round\":\"0\",\"shape\":\"rect\",\"dividerColor\":null,\"bgColor\":\"#4d4d4d\",\"dividerStroke\":null,\"strokeColor\":\"#ffffff\",\"strokeStyle\":\"0\",\"strokeWidth\":\"0\",\"opacity\":\"1\"},\"physics_node\":{\"dividerCollision\":null,\"collisionRadius\":10,\"collisionRadiusAuto\":true,\"dividerManyBodyForce\":null,\"manyBodyForceStrength\":80,\"manyBodyForceRangeMin\":10,\"manyBodyForceRangeMax\":112,\"dividerManyFixPosition\":null,\"fixPosition\":true},\"text_node\":{\"showText\":\"下划线节点，双击编辑文字\",\"textColor\":\"#bfbfbf\",\"textFont\":null,\"textSize\":4,\"textSpacing\":0,\"textWeight\":5},\"css_node\":{\"content\":\"border-bottom:2px solid rgba(255,255,255,0.5);\"}},\"vx\":0,\"vy\":0,\"x\":1067.272659176477,\"y\":-20.870662972764347,\"cx\":1067.272659176477,\"cy\":-20.870662972764347}]`
    },
]

let currentGraph = null;

// 用户配置
export let userConfig = {
    isDark: true,
    isLogin: false,
    currentGraphFileName: "",
    username: null,
    uid: null,
    isFullScreen: false,
    isEditMode: true
}

/**
 * 反转界面色彩风格
 */
export function reverseColorMode() {
    userConfig.isDark = !userConfig.isDark;
    if (userConfig.isDark) {
        document.querySelector(".mainWindow").classList = "mainWindow darkMode";
    } else {
        document.querySelector(".mainWindow").classList = "mainWindow lightMode";
    }
}

/**
 * 保存到本地
 */
export function saveGraph(graph) {
    let blob = new Blob([graph.toJson()]);
    saveAs(blob, +new Date() + ".vgd");
}

/**
 * 导出为SVG
 */
export function exportSvg(graph) {
    graph.exportSvg();
}

/**
 * 导出为PNG
 */
export function exportPng(graph) {
    graph.exportPng();
}

/**
 * 导出为JPG
 */
export function exportJpg(graph) {
    graph.exportJpg();
}

/**
 * 从本地打开导图文件
 */
export function openGraph(graph) {
    let elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            let reader;
            let data;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                document.querySelector("#loadGraph").style.opacity = 1;
                window.setTimeout(() => {
                    userConfig.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                    refreshGraphName();
                    graph.clear();
                    data = JSON.parse(readRes.target.result);
                    graph.load(data, true);
                    hideDyaTemplateArea();
                }, 1);
            });
            reader.addEventListener("error", () => {
                alert("打开文件失败");
            });
        } catch {
            console.error("打开文件出错");
        }
    })
}

/**
 * 新建导图
 */
export function newGraph(graph) {
    userConfig.currentGraphFileName = "未命名图谱";
    refreshGraphName();
    graph.clear();
    graph.load(newGraphJson, true);
    hideDyaTemplateArea();
}

/**
 * 设置导图背景颜色
 */
export function setGraphBackgroundColor(graph) {
    graph.setBgColor(document.querySelector("#bgColorInput").value);
}

/**
 * 用户注册
 */
export function userRegister() {
    let username = document.querySelector("#register_username").value;
    let password1 = document.querySelector("#register_password1").value;
    let password2 = document.querySelector("#register_password2").value;
    let email = document.querySelector("#register_email").value;
    if (password1 != password2) {
        document.querySelector("#password_conflict").classList = "hint show";
        return;
    }
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password1);
    formData.append("email", email);
    axios({
        url: USER_REGISTER,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(d => {
        if (d.data.state == 1) {
            // 跳转登录
            hideCenterWindow(document.querySelector("#windowRegister"));
            showLogin();
        } else if (d.data.state == 0) {
            document.querySelector("#user_name_exist").classList = "hint show";
        }
    })
}

/**
 * 用户登录
 */
export function userLogin() {
    let username = document.querySelector("#login_username").value;
    let password = document.querySelector("#login_password").value;
    let formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    axios({
        url: USER_LOGIN,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(async d => {
        if (d.data.state == 1) {
            setCookie('jwt', d.data.jwt, 1000 * 60 * 60 * 1000);
            // 获取用户信息进行显示
            let userData = await getUserData();
            refreshUserData(userData);
            hideCenterWindow(document.querySelector("#windowLogin"));
        } else if (d.data.state == 2) {
            document.querySelector("#login_password").value = "";
            document.querySelector("#hint_password_incorrect").classList = "hint show";
        } else if (d.data.state == 3) {
            document.querySelector("#login_username").value = "";
            document.querySelector("#login_password").value = "";
            document.querySelector("#hint_user_not_exist").classList = "hint show";
        }
    })
}

/**
 * 用户退出
 */
export async function userLogout() {
    delCookie("jwt");
    let userData = await getUserData();
    refreshUserData(userData);
}

/**
 * 另存到云
 */
export function saveToCloud(graph) {
    let name = document.querySelector("#stc_path").value;
    let svg = graph.genSvg();
    // 先上传图片
    let domFileInput = document.createElement("input");
    domFileInput.type = "file";

    let formData = new FormData();
    formData.append('svg', svg);
    axios({
        url: GRAPH_SVG_UPLOAD_PATH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(async d => {
        if (name) {
            // 保存到云
            let data = graph.toJson();
            let response = await saveGraphToCloud(data, name, d.data.msg.filename);
            if (response.state == 11 || response.state == 10) {
                userConfig.currentGraphFileName = name;
                refreshGraphName();
                hideCenterWindow(document.querySelector("#windowSaveToCloud"))
            }
        }
    });
}

/**
 * 根据是否登录更新窗体
 */
export function refreshMenu() {
    if (userConfig.isLogin) {
        document.querySelector("#btnLogin").classList = "hide";
        document.querySelector("#btnRegister").classList = "hide";
        document.querySelector("#btnLogout").classList = "show";
        document.querySelector("#btnUserPage").classList = "show";
        document.querySelector("#btnToCloudSavsAs").classList = "show";
        document.querySelector("#btnLoadFromCloud").classList = "show";
        document.querySelector("#btnSetGraphProperty").classList = "show";
    } else {
        document.querySelector("#btnLogin").classList = "show";
        document.querySelector("#btnRegister").classList = "show";
        document.querySelector("#btnLogout").classList = "hide";
        document.querySelector("#btnUserPage").classList = "hide";
        document.querySelector("#btnToCloudSavsAs").classList = "hide";
        document.querySelector("#btnLoadFromCloud").classList = "hide";
        document.querySelector("#btnSetGraphProperty").classList = "hide";
    }
}

/**
 * 更新导图名称
 */
export function refreshGraphName() {
    if (userConfig.currentGraphFileName) {
        document.querySelector("#graphName").innerHTML = userConfig.currentGraphFileName;
        window.history.replaceState("", "", `${EDITOR_PGAE}`);
    }
}

/**
 * 更新用户信息
 */
export function refreshUserData(d) {
    if (d.data.state == 1) {
        document.querySelector("#showUsername").innerHTML = d.data.msg.data.username;
        document.querySelector("#showUserAvatar").src = `${AVATAR_STORE_PATH}${d.data.msg.data.avatar}`;
        userConfig.isLogin = true;
        userConfig.username = d.data.msg.data.username;
        userConfig.uid = d.data.msg.data.id;
        refreshMenu();
    } else {
        document.querySelector("#showUsername").innerHTML = "未登录";
        document.querySelector("#showUserAvatar").src = defaultAvatarPng;
        userConfig.isLogin = false;
        userConfig.username = null;
        refreshMenu();
    }
}

/**
 * 跳转个人主页
 */
export function toUserPage() {
    window.open(`${USER_PAGE}?uid=${userConfig.uid}&username=${userConfig.username}`);
}

/**
 * 重启物理模拟
 */
export function restartSim(graph) {
    graph.renderProperties.simulation.stop();
    graph.modifyNodePhysics();
    graph.modifyEdgePhysics();
    graph.renderProperties.simulation.alphaTarget(0.02).restart();
}

/**
 * 从本地打开代码片段
 */
export function openCode(graph) {
    let elementInput = document.createElement("input");
    elementInput.type = "file";
    elementInput.accept = "file/js";
    elementInput.click();
    elementInput.addEventListener("input", () => {
        try {
            document.querySelector("#loadGraph").style.opacity = 1;
            let reader;
            if (window.FileReader) {
                reader = new FileReader();
            } else {
                alert("你的浏览器不支持访问本地文件");
            }
            reader.readAsText(elementInput.files[0]);
            reader.addEventListener("load", (readRes) => {
                userConfig.currentGraphFileName = elementInput.files[0].name.split(".")[0];
                refreshGraphName();
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
                    document.querySelector(".dyaTemplateArea").style.display = "none";
                    let codeEval = `
                    ${readRes.target.result};
                    try{
                    bind();
                    }catch{}
                    window.main=main;
                    window.graphData=main();
                    `;
                    eval(codeEval);

                    graph.clear();
                    let data = JSON.parse(window.graphData.toJson());
                    graph.load(data, true);
                    currentGraph = graph;
                } catch (e) {
                    document.querySelector("#loadGraph").style.opacity = 0;
                    showCodeError(e.message);
                }
            });
            reader.addEventListener("error", () => {
                alert("打开文件失败");
            });
        } catch {
            console.error("打开文件出错");
        }
    })
}

/**
 * 从本地代码加载
 */
export function loadGraphFromCode() {
    // 数据绑定的部分不需要重新执行
    try {
        eval("window.graphData=window.main();");
        currentGraph.clear();
        let data = JSON.parse(window.graphData.toJson());
        currentGraph.load(data);
    } catch (e) {
        showCodeError(e.message);
    }
}

/**
 * 全屏浏览
 */
export function refreshFullScreen(graph, refresh = true) {
    if (refresh)
        userConfig.isFullScreen = !userConfig.isFullScreen;
    if (userConfig.isFullScreen) {
        // 全屏模式
        graph.renderProperties.svg
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
        document.querySelector(".displayArea").style.zInde = 9999;
        document.querySelector(".mainMenu").style.zIndex = -1;
        document.querySelector(".topArea").style.top = "5px";
        document.querySelector(".panArea").style.display = "none";
        document.querySelector(".dyaTemplateArea").style.display = "none";
        document.querySelector(".addNodeArea").style.display = "none";
        document.querySelector("#fullScreenBtn").innerHTML = `| 全屏模式<i class="fa fa-cube"></i>`;
    } else {
        // 窗口模式
        graph.renderProperties.svg
            .attr("width", document.querySelector(".displayArea").offsetWidth)
            .attr("height", document.querySelector(".displayArea").offsetHeight)
        document.querySelector(".displayArea").style.zInde = 1;
        document.querySelector(".mainMenu").style.zIndex = 99;
        document.querySelector(".topArea").style.top = document.querySelector(".mainMenu").offsetHeight + 5 + "px";
        document.querySelector(".panArea").style.display = "block";
        document.querySelector(".addNodeArea").style.display = "block";
        document.querySelector("#fullScreenBtn").innerHTML = `| 窗口模式<i class="fa fa-cube"></i>`;
    }
}

/**
 * 切换编辑/浏览模式
 */
export function refreshEditMode(graph) {
    if (userConfig.isEditMode) {
        graph.locked = true;
        graph.reload();
        document.querySelector("#editGraphBtn").innerHTML = `| 锁定模式<i class="fa fa-lock"></i>`;
    } else {
        graph.locked = false;
        graph.reload();
        document.querySelector("#editGraphBtn").innerHTML = `| 编辑模式<i class="fa fa-edit"></i>`;
    }
    window.setTimeout(() => {
        refreshFullScreen(graph, false);
    }, 300);
    userConfig.isEditMode = !userConfig.isEditMode;
}

/**
 * 启用/撤销格点吸附模式
 */
export function refreshAlignBlock(graph, value) {
    if (value)
        graph.alignBlock = true
    else
        graph.alignBlock = false;
}

/**
 * 从模板添加节点
 */
function addTpNode(nodeTp, graph) {
    graph.addNodeFromString(nodeTp.nodeString);
}

/**
 * 加载节点添加列表
 */
export function initNodeAddWindow(graph) {
    let domContainer = document.querySelector(".addNodeArea .content ul");
    for (let i = 0; i < addNodeList.length; i++) {
        let currentNodeTp = addNodeList[i];
        let nodeContainer = document.createElement("li");
        nodeContainer.style.backgroundImage = `url(./nodeTp/${currentNodeTp.name}.png)`;
        nodeContainer.title = currentNodeTp.showName;
        nodeContainer.onclick = function () {
            addTpNode(currentNodeTp, graph);
        }
        domContainer.appendChild(nodeContainer);
    }
}

/**
 * 展示中央窗体
 */
export function showAuthorList() {
    showCenterWindow(document.querySelector("#windowAuthorList"));
}
export function showLogin() {
    showCenterWindow(document.querySelector("#windowLogin"));
}
export function showRegister() {
    showCenterWindow(document.querySelector("#windowRegister"));
}
export function showPay() {
    showCenterWindow(document.querySelector("#windowPay"));
}
export function showCodeError(message) {
    showCenterWindow(document.querySelector("#windowCodeError"));
    document.querySelector("#codeErrorShow").innerHTML = message;
    document.querySelector("#closeCodeError").onclick = () => {
        hideCenterWindow(document.querySelector("#windowCodeError"));
    }
}
export function showMessage(message) {
    showCenterWindow(document.querySelector("#windowShowMessage"));
    document.querySelector("#msgShowArea").innerHTML = message;
    document.querySelector("#msgAccept").onclick = () => {
        hideCenterWindow(document.querySelector("#windowShowMessage"));
    }
}
export async function showShareLink() {
    showCenterWindow(document.querySelector("#windowShareLink"));
    // 获取数据填入窗体
    let response = await loadGraphConfig(userConfig.currentGraphFileName);
    if (response.state == 1) {
        let graphName = response.msg.name;
        let uid = response.msg.author.id;
        let url = `${EDITOR_PGAE}?graphName=${encodeURI(graphName)}&uid=${uid}&fs=true&lc=true`;
        document.querySelector("#linkShowArea").innerHTML = url;
        document.querySelector("#btnWindowShare").onclick = function () {
            let clipboardObj = navigator.clipboard;
            clipboardObj.writeText(url);
        }
    } else {
        hideCenterWindow(document.querySelector("#windowShareLink"));
        showMessage("请先保存到云再分享");
    }
}
export async function showGraphProperty() {
    showCenterWindow(document.querySelector("#windowGraphProperty"));
    // 获取数据填入窗体
    let response = await loadGraphConfig(userConfig.currentGraphFileName);
    if (response.state == 1) {
        if (response.msg.isPublic) {
            document.querySelector("#radioPublic").checked = true;
        } else {
            document.querySelector("#radioPrivate").checked = true;
        }
        document.querySelector("#graphInfoInput").value = response.msg.info;
    }
    document.querySelector("#updateGraphProperty").onclick = async () => {
        let isPublic = 0;
        if (document.querySelector("#radioPublic").checked) isPublic = 1;
        let info = document.querySelector("#graphInfoInput").value;
        // 发送请求
        response = await configGraph(userConfig.currentGraphFileName, isPublic, info);
        if (response.state == 1) {
            hideCenterWindow(document.querySelector("#windowGraphProperty"));
        }else{
            hideCenterWindow(document.querySelector("#windowGraphProperty"));
            showMessage("请先保存到云再设置");
        }
    }
}
export function showTextEditor(toDom, fnChange = () => { }, fnDone = () => { }) {
    showCenterWindow(document.querySelector("#windowTextEditor"));
    document.querySelector("#textEditorTextarea").value = toDom.value;
    document.querySelector("#textEditorTextarea").oninput = () => {
        toDom.value = document.querySelector("#textEditorTextarea").value;
        fnChange(toDom.value);
    }
    document.querySelector("#textEditorTextarea").onkeydown = function (e) {
        if (e.keyCode == 9) {
            let position = this.selectionStart + 2;
            this.value = this.value.substr(0, this.selectionStart) + '  ' + this.value.substr(this.selectionStart);
            this.selectionStart = position;
            this.selectionEnd = position;
            this.focus();
            e.preventDefault();
        }
    };
    document.querySelector("#editTextFinish").onclick = () => {
        hideCenterWindow(document.querySelector("#windowTextEditor"));
        fnDone();
    }
}

/**
 * 保存到云
 */
export async function showSaveToCloud() {
    document.querySelector("#saveToCloud").innerHTML = "保存";
    document.querySelector("#windowSaveToCloud ul").innerHTML = "";
    let graphList = await listUserGraph();
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = async () => {
            let response = await deleteGraph(currentGraph.name);
            if (response.state == 1) {
                domGraphTagClose.remove();
                domGraphTagDate.remove();
                domGraphTagName.remove();
                domGraphTag.remove();
            }
        };
        domGraphTag.appendChild(domGraphTagImg);
        domGraphTag.appendChild(domGraphTagName);
        domGraphTag.appendChild(domGraphTagDate);
        domGraphTag.appendChild(domGraphTagClose);

        domGraphTag.addEventListener("click", () => {
            document.querySelector("#stc_path").value = currentGraph.name;
            document.querySelector("#saveToCloud").innerHTML = "覆盖";
        });
        document.querySelector("#windowSaveToCloud ul").appendChild(domGraphTag);
    }
    document.querySelector("#stc_path").addEventListener("input", () => {
        for (let graph of graphList) {
            if (graph.name == document.querySelector("#stc_path").value) {
                document.querySelector("#saveToCloud").innerHTML = "覆盖";
            } else {
                document.querySelector("#saveToCloud").innerHTML = "保存";
            }
        }
    });
    showCenterWindow(document.querySelector("#windowSaveToCloud"));
}


/**
 * 从云打开
 */
export async function showLoadFromCloud(graph) {
    document.querySelector("#windowLoadFromCloud ul").innerHTML = "";
    let graphList = await listUserGraph();
    for (let i = 0; i < graphList.length; i++) {
        let currentGraph = graphList[i];

        let domGraphTag = document.createElement("li");
        let domGraphTagImg = document.createElement("img");
        domGraphTagImg.src = `${GRAPH_PNG_STORE_PATH}${currentGraph.img}`;
        domGraphTagImg.classList = "showImg";
        let domGraphTagName = document.createElement("span");
        domGraphTagName.classList = "graphName";
        domGraphTagName.innerHTML = currentGraph.name;
        let domGraphTagDate = document.createElement("span");
        domGraphTagDate.classList = "graphDate";
        domGraphTagDate.innerHTML = currentGraph.date.split("T")[0];
        let domGraphTagClose = document.createElement("span");
        domGraphTagClose.classList = "closeBtn";
        domGraphTagClose.innerHTML = "×";
        domGraphTagClose.onclick = async () => {
            let response = await deleteGraph(currentGraph.name);
            if (response.state == 1) {
                domGraphTagClose.remove();
                domGraphTagDate.remove();
                domGraphTagName.remove();
                domGraphTag.remove();
            }
        };
        domGraphTag.appendChild(domGraphTagImg);
        domGraphTag.appendChild(domGraphTagName);
        domGraphTag.appendChild(domGraphTagDate);
        domGraphTag.appendChild(domGraphTagClose);

        domGraphTagName.onclick = async () => {
            document.querySelector("#loadGraph").style.opacity = 1;
            let response = await loadGraphFromCloud(currentGraph.name);
            if (response.state == 1) {
                userConfig.currentGraphFileName = currentGraph.name;
                refreshGraphName();
                let json = response.msg;
                graph.clear();
                graph.load(JSON.parse(json), true);
                hideDyaTemplateArea();
                hideCenterWindow(document.querySelector("#windowLoadFromCloud"));
            }
        };
        document.querySelector("#windowLoadFromCloud ul").appendChild(domGraphTag);
    }
    showCenterWindow(document.querySelector("#windowLoadFromCloud"));
}

/**
 * 从范例新建
 */
export function showTemplate(graph) {
    let domAddedContainer = document.createElement("ul");
    for (let template of templateList) {
        let domAddedLi = document.createElement("li");
        domAddedLi.onclick = () => {
            document.querySelector("#loadGraph").style.opacity = 1;
            userConfig.currentGraphFileName = template.showName;
            refreshGraphName();
            // 请求本地文件
            axios.get(`./graphTemplate/${template.name}.vgd`).then(res => {
                graph.clear();
                graph.load(res.data, true);
                hideDyaTemplateArea();
                hideCenterWindow(document.querySelector("#windowTemplate"));
            });
        }
        let domAddedImg = document.createElement("img");
        domAddedImg.src = `./graphTemplate/${template.name}.png`;
        let domAddedP = document.createElement("p");
        domAddedP.innerHTML = template.showName;
        domAddedLi.appendChild(domAddedImg);
        domAddedLi.appendChild(domAddedP);
        domAddedContainer.appendChild(domAddedLi);
    }
    document.querySelector("#windowTemplate .content").innerHTML = "";
    document.querySelector("#windowTemplate .content").appendChild(domAddedContainer);
    showCenterWindow(document.querySelector("#windowTemplate"));
}

/**
 * 从模板新建
 */
export function showTemplateDya(graph) {
    let domAddedContainer = document.createElement("ul");
    for (let template of templateDyaList) {
        let domAddedLi = document.createElement("li");
        domAddedLi.onclick = () => {
            document.querySelector("#loadGraph").style.opacity = 1;
            userConfig.currentGraphFileName = template.showName;
            refreshGraphName();
            // 请求本地文件
            axios.get(`./graphTemplate/${template.name}.js`).then(res => {
                userConfig.currentGraphFileName = template.showName;
                refreshGraphName();
                window.graphData = "";
                try {
                    // 执行代码
                    document.querySelector(".dyaTemplateArea").style.display = "block";
                    document.querySelector("#dyaTemplateContent").innerHTML = "";
                    document.querySelector(".dyaTemplateArea").style.display = "none";
                    let codeEval = `
                    ${res.data};
                    try{
                    bind();
                    }catch{}
                    window.main=main;
                    window.graphData=main();
                    `;
                    eval(codeEval);

                    graph.clear();
                    let data = JSON.parse(window.graphData.toJson());
                    graph.load(data, true);
                    currentGraph = graph;
                } catch (e) {
                    showCodeError(e.message);
                }
                hideCenterWindow(document.querySelector("#windowTemplateDya"));
            });
        }
        let domAddedImg = document.createElement("img");
        domAddedImg.src = `./graphTemplate/${template.name}.png`;
        let domAddedP = document.createElement("p");
        domAddedP.innerHTML = template.showName;
        domAddedLi.appendChild(domAddedImg);
        domAddedLi.appendChild(domAddedP);
        domAddedContainer.appendChild(domAddedLi);
    }
    document.querySelector("#windowTemplateDya .content").innerHTML = "";
    document.querySelector("#windowTemplateDya .content").appendChild(domAddedContainer);
    showCenterWindow(document.querySelector("#windowTemplateDya"));
}


function showCenterWindow(selector) {
    document.querySelectorAll(".hint").forEach(dom => {
        dom.classList = "hint hide";
    })
    selector.style.opacity = 1;
    selector.style.pointerEvents = "all";
    selector.style.transition = "0.3s ease-in-out";
    // 绑定关闭事件
    selector.querySelector(".centerWindowCloseBtn").onclick = function () {
        hideCenterWindow(selector);
    }
    if (selector.querySelector(".close"))
        selector.querySelector(".close").addEventListener("click", function () {
            hideCenterWindow(selector);
        });
}

function hideCenterWindow(selector) {
    selector.style.opacity = 0;
    selector.style.pointerEvents = "none";
}

export function hideDyaTemplateArea() {
    document.querySelector(".dyaTemplateArea").style.display = "none";
    document.querySelector("#dyaTemplateContent").innerHTML = "";
}