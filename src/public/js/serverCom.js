import axios from "axios";
import { getCookie } from "./tools";
import {
    EXTRACT_TEXT,
    GET_NODE_STORE,
    GRAPH_SVG_UPLOAD_PATH,
    LIST_PUBLIC_GRAPH,
    NODE_UPLOAD_PATH,
    USER_CONFIG_GRAPH,
    USER_DATA,
    USER_DELETE_GRAPH,
    USER_GET_USERLIST,
    USER_LIST_GRAPH_PATH,
    USER_LOAD_FROM_CLOUD,
    USER_LOAD_GRAPH_CONFIG,
    USER_LOGIN,
    USER_ODATA,
    USER_REGISTER,
    USER_SAVE_GRAPH_TO_CLOUD,
    USER_UPDATE_AVATAR
} from "./urls";
import { userConfig, refreshMenu } from "../../graphEditor/js/event";

function getServerCom(url, kv) {
    let formData = new FormData();
    for (let key in kv) {
        formData.append(key, kv[key]);
    }
    return axios({
        url: url,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
}

/**
 * 获取登录用户的信息
 */
export async function getUserData() {
    return (await getServerCom(USER_DATA, {
        jwt: getCookie("jwt")
    })).data;
}

/**
 * 获取其他用户信息
 */
export async function getOUtherData(uid) {
    return (await getServerCom(USER_ODATA, {
        jwt: getCookie("jwt"),
        uid: uid
    })).data;
}

/**
 * 用户注册
 */
export async function registerUser(username, password, email) {
    return (await getServerCom(USER_REGISTER, {
        username: username,
        password: password,
        email: email
    })).data;
}

/**
 * 用户登录
 */
export async function loginUser(username, password) {
    return (await getServerCom(USER_LOGIN, {
        username: username,
        password: password
    })).data;
}

/**
 * 列举用户的图谱
 */
export async function listUserGraph() {
    return (await getServerCom(USER_LIST_GRAPH_PATH, {
        jwt: getCookie("jwt")
    })).data;
}

/**
 * 储存图谱的SVG到云
 */
export async function saveGraphSvgToCloud(svg) {
    return (await getServerCom(GRAPH_SVG_UPLOAD_PATH, {
        svg: svg
    })).data;
}

/**
 * 储存图谱到云
 */
export async function saveGraphToCloud(jsonData, filename, imgName) {
    return (await getServerCom(USER_SAVE_GRAPH_TO_CLOUD, {
        jwt: getCookie("jwt"),
        json: jsonData,
        name: filename,
        imgName: imgName
    })).data;
}

/**
 * 从云加载导图
 */
export async function loadGraphFromCloud(filename, uid) {
    if (!uid) {
        return (await getServerCom(USER_LOAD_FROM_CLOUD, {
            jwt: getCookie("jwt"),
            name: filename
        })).data;
    } else {
        return (await getServerCom(USER_LOAD_FROM_CLOUD, {
            uid: uid,
            name: filename
        })).data;
    }
}

/**
 * 删除云图谱
 */
export async function deleteGraph(filename) {
    return (await getServerCom(USER_DELETE_GRAPH, {
        jwt: getCookie("jwt"),
        name: filename
    })).data;
}

/**
 * 更新头像
 */
export async function updateAvatar(filename) {
    return (await getServerCom(USER_UPDATE_AVATAR, {
        jwt: getCookie("jwt"),
        avatar: filename
    })).data;
}

/**
 * 配置图谱
 */
export async function configGraph(filename, isPublic, info) {
    return (await getServerCom(USER_CONFIG_GRAPH, {
        jwt: getCookie("jwt"),
        name: filename,
        isPublic: isPublic,
        info: info
    })).data;
}

/**
 * 获取图谱信息
 */
export async function loadGraphConfig(filename) {
    return (await getServerCom(USER_LOAD_GRAPH_CONFIG, {
        jwt: getCookie("jwt"),
        name: filename
    })).data;
}

/**
 * 获取所有的公共图谱
 */
export async function listPublicGraph() {
    return (await getServerCom(LIST_PUBLIC_GRAPH, {})).data;
}

/**
 * 获取所有用户
 */
export async function listUser() {
    return (await getServerCom(USER_GET_USERLIST, {})).data;
}

/**
 * 提取文本关键词
 */
export async function extractText(text, type = "text") {
    return (await getServerCom(EXTRACT_TEXT, {
        text: text,
        type: type
    })).data;
}

/**
 * 静态资源文件上传
 */
export async function uploadStaticFile(url, type, file) {
    let kv = {};
    kv[type] = file;
    return (await getServerCom(url, kv)).data;
}