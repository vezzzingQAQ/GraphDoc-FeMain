import { getOUtherData } from "../public/js/serverCom";
import { getQueryVariable } from "../public/js/tools";
import { USER_AVATAR_ROOT } from "./../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
    let username = getQueryVariable("username");
    let userData = await getOUtherData(username);
    document.querySelector("#userAvatar").src = `${USER_AVATAR_ROOT}${userData.data.msg.avatar}`;
    document.querySelector("#username").innerHTML = userData.data.msg.username;
    let graphList;
});