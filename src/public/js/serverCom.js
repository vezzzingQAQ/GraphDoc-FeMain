import axios from "axios";
import { getCookie } from "./tools";
import {
    USER_DATA,
    USER_DELETE_GRAPH,
    USER_LIST_GRAPH_PATH,
    USER_LOAD_FROM_CLOUD,
    USER_ODATA,
    USER_SAVE_GRAPH_TO_CLOUD
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
export async function getOUtherData(username) {
    let formData = new FormData();
    formData.append('username', username);
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
export async function loadGraphFromCloud(filename) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
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