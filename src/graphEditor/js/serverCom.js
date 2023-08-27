import axios from "axios";
import { getCookie } from "../../public/js/tools";
import {
    USER_AVATAR_ROOT,
    USER_DATA,
    USER_LIST_GRAPH_PATH,
    USER_LOAD_FROM_CLOUD,
    USER_SAVE_GRAPH_TO_CLOUD
} from "./graph/urls";
import defaultAvatarPng from "./../../asset/img/defaultAvatar.png";

/**
 * 获取用户的信息
 */
export function getUserData() {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    axios({
        url: USER_DATA,
        method: "POST",
        headers: {
            "Content-Type": "multipart/form-data"
        },
        data: formData
    }).then(d => {
        if (d.data.state == 1) {
            document.querySelector("#showUsername").innerHTML = d.data.msg.data.username;
            document.querySelector("#showUserAvatar").src = `${USER_AVATAR_ROOT}${d.data.msg.data.avatar}`;
        } else {
            document.querySelector("#showUsername").innerHTML = "未登录";
            document.querySelector("#showUserAvatar").src = defaultAvatarPng;
        }
    });
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
export async function saveGraphToCloud(jsonData, filename) {
    let formData = new FormData();
    formData.append('jwt', getCookie('jwt'));
    formData.append('json', jsonData);
    formData.append('name', filename);
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