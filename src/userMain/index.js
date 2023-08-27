import axios from "axios";
import { userConfig } from "../graphEditor/js/event";
import { getOUtherData, getUserData, updateAvatar } from "../public/js/serverCom";
import { getQueryVariable } from "../public/js/tools";
import { AVATAR_UPLOAD_PATH, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, AVATAR_STORE_PATH } from "./../public/js/urls";
import "./css/index.less";

window.addEventListener("load", async () => {
    let username = getQueryVariable("username");
    let userData = await getOUtherData(username);
    document.querySelector("#userAvatar").src = `${AVATAR_STORE_PATH}${userData.data.msg.avatar}`;
    document.querySelector("#username").innerHTML = userData.data.msg.username;
    let graphList = userData.data.msg.graphs;
    graphList.forEach(graph => {
        let domGraphBlock = document.createElement("li");
        let domGraphBlockImg = document.createElement("div");
        domGraphBlockImg.style.backgroundImage = `url(${GRAPH_PNG_STORE_PATH}${graph.img})`;
        let domGraphBlockText = document.createElement("p");
        domGraphBlockText.innerHTML = graph.name;
        domGraphBlock.appendChild(domGraphBlockImg);
        domGraphBlock.appendChild(domGraphBlockText);
        domGraphBlock.addEventListener("click", async function () {
            let userData = await getUserData();
            username = userData.data.msg.data.username;
            if (username == graph.username)
                window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}`);
        });
        document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
    });
    // 点击头像进行更换
    document.querySelector("#UserAvatar").addEventListener("click", () => {
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
                reader.addEventListener("load", () => {
                    let formData = new FormData();
                    formData.append('pic', elementInput.files[0]);
                    axios({
                        url: AVATAR_UPLOAD_PATH,
                        method: "POST",
                        headers: {
                            "Content-Type": "multipart/form-data"
                        },
                        data: formData
                    }).then(async d => {
                        let filename = d.data.msg.filename;
                        let response = await updateAvatar(filename);
                        if (response.state == 1) {
                            document.querySelector("#userAvatar").src = `${AVATAR_STORE_PATH}${filename}`;
                        }
                    });
                });
                reader.addEventListener("error", () => {
                    alert("打开文件失败");
                });
            } catch {
                console.error("打开文件出错");
            }
        })
    })
});