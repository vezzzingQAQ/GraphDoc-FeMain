import axios from "axios";
import { getCookie } from "../../public/js/tools";
import { USER_AVATAR_ROOT, USER_DATA } from "./graph/urls";
import defaultAvatarPng from "./../../asset/img/defaultAvatar.png";

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