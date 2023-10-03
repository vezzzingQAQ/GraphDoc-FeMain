import axios from "axios";
import { getCookie } from "./tools";
import {
    EXTRACT_TEXT,
    LIST_PUBLIC_GRAPH,
    USER_CONFIG_GRAPH,
    USER_DATA,
    USER_DELETE_GRAPH,
    USER_GET_USERLIST,
    USER_LIST_GRAPH_PATH,
    USER_LOAD_FROM_CLOUD,
    USER_LOAD_GRAPH_CONFIG,
    USER_ODATA,
    USER_SAVE_GRAPH_TO_CLOUD,
    USER_UPDATE_AVATAR
} from "./urls";
import { userConfig, refreshMenu } from "../../graphEditor/js/event";

/**
 * 获取登录用户的信息
 */
export async function getUserData() {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    let response = await axios({
        url: USER_DATA,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response;
}

/**
 * 获取其他用户信息
 */
export async function getOUtherData(uid) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('uid', uid);
    let response = await axios({
        url: USER_ODATA,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response;
}

/**
 * 列举用户的图谱
 */
export async function listUserGraph() {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    let response = await axios({
        url: USER_LIST_GRAPH_PATH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    let graphList = response.data.msg;
    return graphList;
}

/**
 * 储存图谱到云
 */
export async function saveGraphToCloud(jsonData, filename, imgName) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('json', jsonData);
    formData.append('name', filename);
    formData.append('imgName', imgName);
    let response = await axios({
        url: USER_SAVE_GRAPH_TO_CLOUD,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 从云加载导图
 */
export async function loadGraphFromCloud(filename, uid) {
    let formData = new FormData();
    if (!uid) {
        formData.append('jwt', getCookie('jwt'));
    } else {
        formData.append('uid', uid);
    }
    formData.append('name', filename);
    let response = await axios({
        url: USER_LOAD_FROM_CLOUD,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 删除云图谱
 */
export async function deleteGraph(filename) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('name', filename);
    let response = await axios({
        url: USER_DELETE_GRAPH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 更新头像
 */
export async function updateAvatar(filename) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('avatar', filename);
    let response = await axios({
        url: USER_UPDATE_AVATAR,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 配置图谱
 */
export async function configGraph(filename, isPublic, info) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('name', filename);
    formData.append('isPublic', isPublic);
    formData.append('info', info);
    let response = await axios({
        url: USER_CONFIG_GRAPH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 获取图谱信息
 */
export async function loadGraphConfig(filename) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('name', filename);
    let response = await axios({
        url: USER_LOAD_GRAPH_CONFIG,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}

/**
 * 获取所有的公共图谱
 */
export async function listPublicGraph() {
    let response = await axios({
        url: LIST_PUBLIC_GRAPH,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

/**
 * 获取所有用户
 */
export async function listUser() {
    let response = await axios({
        url: USER_GET_USERLIST,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
}

/**
 * 提取文本关键词
 */
export async function extractText(text) {
    let formData = new FormData();
    formData.append('text', text);
    let response = await axios({
        url: EXTRACT_TEXT,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    });
    return response.data;
}