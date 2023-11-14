import { userConfig } from "../graphEditor/js/event";
import { getOUtherData, getUserData, updateAvatar, uploadStaticFile } from "../public/js/serverCom";
import { getQueryVariable } from "../public/js/tools";
import { AVATAR_UPLOAD_PATH, EDITOR_PGAE, GRAPH_PNG_STORE_PATH, AVATAR_STORE_PATH } from "./../public/js/urls";
import "./css/index.less";
import mainBg from "./../asset/img/icon/mainBg.jpg";
import { setWindowIcon } from "../public/js/iconSetter";

window.addEventListener("load", async () => {
    setWindowIcon();
    let uid = getQueryVariable("uid");
    let visitedUserData = await getOUtherData(uid);
    document.querySelector("#userAvatar").src = `${AVATAR_STORE_PATH}${visitedUserData.msg.avatar}`;
    document.querySelector("#username").innerHTML = visitedUserData.msg.username;
    let graphList = visitedUserData.msg.graphs;
    graphList.forEach(graph => {
        let domGraphBlock = document.createElement("li");
        let domGraphBlockImg = document.createElement("div");
        domGraphBlockImg.style.backgroundImage = `url(${GRAPH_PNG_STORE_PATH}${graph.img})`;
        let domGraphBlockText = document.createElement("p");
        domGraphBlockText.innerHTML = graph.name;
        domGraphBlock.appendChild(domGraphBlockImg);
        domGraphBlock.appendChild(domGraphBlockText);
        domGraphBlock.addEventListener("click", async function () {
            let uid = graph.uid;
            window.open(`${EDITOR_PGAE}?graphName=${encodeURI(graph.name)}&uid=${uid}`);
        });
        document.querySelector(".graphListBlock ul").appendChild(domGraphBlock)
    });

    // 点击头像进行更换
    let loginUserData = await getUserData();
    if (loginUserData.state == 1) {
        let loginId = loginUserData.msg.data.id;
        if (loginId == uid) {
            document.querySelector("#UserAvatar").addEventListener("click", () => {
                let elementInput = document.createElement("input");
                elementInput.type = "file";
                elementInput.accept = "image/gif,image/jpeg,image/jpg,image/png";
                elementInput.click();
                elementInput.addEventListener("input", () => {
                    try {
                        let reader;
                        if (window.FileReader) {
                            reader = new FileReader();
                        } else {
                            alert("你的浏览器不支持访问本地文件");
                        }
                        // 限制头像大小
                        let maxSize = 5;
                        if (elementInput.files[0].size > 1024 * 1024 * maxSize) {
                            alert("请上传小于5M的图作为头像( ´･･)ﾉ(._.`)");
                            return;
                        }
                        reader.readAsText(elementInput.files[0]);
                        reader.addEventListener("load", async () => {
                            let avatarUploadData = await uploadStaticFile(AVATAR_UPLOAD_PATH, "pic", elementInput.files[0]);
                            let filename = avatarUploadData.msg.filename;
                            let avatarUpdateData = await updateAvatar(filename);
                            if (avatarUpdateData.state == 1) {
                                document.querySelector("#userAvatar").src = `${AVATAR_STORE_PATH}${filename}`;
                            }
                        });
                        reader.addEventListener("error", () => {
                            alert("打开文件失败");
                        });
                    } catch {
                        console.error("打开文件出错");
                    }
                })
            });
        } else {
            document.querySelector("#changeAvatar").style.display = "none";
        }
    } else {
        document.querySelector("#changeAvatar").style.display = "none";
    }

    // 计算窗口滚动百分比
    let totalH = document.body.scrollHeight || document.documentElement.scrollHeight;
    let clientH = window.innerHeight || document.documentElement.clientHeight;
    window.addEventListener("scroll", function (e) {
        let validH = totalH - clientH;
        let scrollH = document.body.scrollTop || document.documentElement.scrollTop;
        let result = scrollH / validH;
        document.querySelector(".mainWindow").style.backgroundColor = `rgb(
                ${255 - result * 255},
                ${255 - result * 255},
                ${255 - result * 255}
            )`
    });

    // 引入图片
    document.querySelector("#footerImg").src = mainBg;

    // 页脚模式切换
    if (process.env.RUN_ENV == "app") {
        document.querySelector(".webFooter").style.display = "none";
        document.querySelector(".appFooter").style.display = "flex";
    } else {
        document.querySelector(".webFooter").style.display = "flex";
        document.querySelector(".appFooter").style.display = "none";
    }
});