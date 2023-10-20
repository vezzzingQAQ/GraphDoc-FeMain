let DOMAIN_RES;

let IMG_UPLOAD_PATH;
let IMG_STORE_PATH;
let FILE_UPLOAD_PATH;
let FILE_STORE_PATH;
let VIDEO_UPLOAD_PATH;
let VIDEO_STORE_PATH;
let GRAPH_SVG_UPLOAD_PATH;
let GRAPH_PNG_STORE_PATH;
let AVATAR_UPLOAD_PATH;
let AVATAR_STORE_PATH;


let DOMAIN_MAIN;

let USER_REGISTER;
let USER_LOGIN;
let USER_DATA;
let USER_AVATAR_ROOT;
let USER_LIST_GRAPH_PATH;
let USER_SAVE_GRAPH_TO_CLOUD;
let USER_LOAD_FROM_CLOUD;
let USER_DELETE_GRAPH;
let USER_ODATA;
let USER_UPDATE_AVATAR;
let USER_CONFIG_GRAPH;
let USER_LOAD_GRAPH_CONFIG;
let USER_GET_USERLIST;
let EXTRACT_TEXT;

let LIST_PUBLIC_GRAPH;

let DOMAIN_FE;

let EDITOR_PGAE;
let USER_PAGE;
let DISPLAY_PAGE;
let PUBLIC_PAGE;

let DOMAIN_COMPONENT;

let FUNC1_COMP;

let DOWNLOAD_LINK = "http://vezzzing.cn/GraphDoc/Download/GraphDoc-win32-x64.zip";

if (process.env.APP_MODE == "production") {
    DOMAIN_RES = "http://121.40.159.180:7891";

    IMG_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadImg/`;
    IMG_STORE_PATH = `${DOMAIN_RES}/media/images/`;
    FILE_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadFile/`;
    FILE_STORE_PATH = `${DOMAIN_RES}/media/files/`;
    VIDEO_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadVideo/`;
    VIDEO_STORE_PATH = `${DOMAIN_RES}/media/videos/`;
    GRAPH_SVG_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadGraphSvg/`;
    GRAPH_PNG_STORE_PATH = `${DOMAIN_RES}/media/graphImgs/png/`;
    AVATAR_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadAvatar/`;
    AVATAR_STORE_PATH = `${DOMAIN_RES}/media/avatars/`;


    DOMAIN_MAIN = "http://121.40.159.180:7892";

    USER_REGISTER = `${DOMAIN_MAIN}/user/register`;
    USER_LOGIN = `${DOMAIN_MAIN}/user/login`;
    USER_DATA = `${DOMAIN_MAIN}/user/data`;
    USER_AVATAR_ROOT = `${DOMAIN_MAIN}/media/avatars/`;
    USER_LIST_GRAPH_PATH = `${DOMAIN_MAIN}/graph/listGraph`;
    USER_SAVE_GRAPH_TO_CLOUD = `${DOMAIN_MAIN}/graph/saveGraph`;
    USER_LOAD_FROM_CLOUD = `${DOMAIN_MAIN}/graph/loadGraph`;
    USER_DELETE_GRAPH = `${DOMAIN_MAIN}/graph/deleteGraph`;
    USER_ODATA = `${DOMAIN_MAIN}/user/odata`;
    USER_UPDATE_AVATAR = `${DOMAIN_MAIN}/user/updateAvatar`;
    USER_CONFIG_GRAPH = `${DOMAIN_MAIN}/graph/configGraph`;
    USER_LOAD_GRAPH_CONFIG = `${DOMAIN_MAIN}/graph/loadGraphConfig`;
    USER_GET_USERLIST = `${DOMAIN_MAIN}/user/getUserList`;
    EXTRACT_TEXT = `${DOMAIN_MAIN}/tagger/extractText`;

    LIST_PUBLIC_GRAPH = `${DOMAIN_MAIN}/graph/listPublicGraph`;

    DOMAIN_FE = "http://vezzzing.cn/GraphDoc/Main";

    EDITOR_PGAE = `${DOMAIN_FE}/dist/graphEditor.html`;
    USER_PAGE = `${DOMAIN_FE}/dist/userMain.html`;
    DISPLAY_PAGE = `${DOMAIN_FE}/dist/visualization.html`;
    PUBLIC_PAGE = `${DOMAIN_FE}/dist/publicMain.html`;

    DOMAIN_COMPONENT = "http://vezzzing.cn/GraphDoc/Component";

    FUNC1_COMP = `${DOMAIN_COMPONENT}/dist/function1Plot.html`;
} else {
    DOMAIN_RES = "http://127.0.0.1:4999";

    IMG_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadImg/`;
    IMG_STORE_PATH = `${DOMAIN_RES}/media/images/`;
    FILE_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadFile/`;
    FILE_STORE_PATH = `${DOMAIN_RES}/media/files/`;
    VIDEO_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadVideo/`;
    VIDEO_STORE_PATH = `${DOMAIN_RES}/media/videos/`;
    GRAPH_SVG_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadGraphSvg/`;
    GRAPH_PNG_STORE_PATH = `${DOMAIN_RES}/media/graphImgs/png/`;
    AVATAR_UPLOAD_PATH = `${DOMAIN_RES}/fileUpload/uploadAvatar/`;
    AVATAR_STORE_PATH = `${DOMAIN_RES}/media/avatars/`;


    DOMAIN_MAIN = "http://127.0.0.1:4998";

    USER_REGISTER = `${DOMAIN_MAIN}/user/register`;
    USER_LOGIN = `${DOMAIN_MAIN}/user/login`;
    USER_DATA = `${DOMAIN_MAIN}/user/data`;
    USER_AVATAR_ROOT = `${DOMAIN_MAIN}/media/avatars/`;
    USER_LIST_GRAPH_PATH = `${DOMAIN_MAIN}/graph/listGraph`;
    USER_SAVE_GRAPH_TO_CLOUD = `${DOMAIN_MAIN}/graph/saveGraph`;
    USER_LOAD_FROM_CLOUD = `${DOMAIN_MAIN}/graph/loadGraph`;
    USER_DELETE_GRAPH = `${DOMAIN_MAIN}/graph/deleteGraph`;
    USER_ODATA = `${DOMAIN_MAIN}/user/odata`;
    USER_UPDATE_AVATAR = `${DOMAIN_MAIN}/user/updateAvatar`;
    USER_CONFIG_GRAPH = `${DOMAIN_MAIN}/graph/configGraph`;
    USER_LOAD_GRAPH_CONFIG = `${DOMAIN_MAIN}/graph/loadGraphConfig`;
    USER_GET_USERLIST = `${DOMAIN_MAIN}/user/getUserList`;
    EXTRACT_TEXT = `${DOMAIN_MAIN}/tagger/extractText`;

    LIST_PUBLIC_GRAPH = `${DOMAIN_MAIN}/graph/listPublicGraph`;

    DOMAIN_FE = "http://127.0.0.1:5500";

    EDITOR_PGAE = `${DOMAIN_FE}/dist/graphEditor.html`;
    USER_PAGE = `${DOMAIN_FE}/dist/userMain.html`;
    DISPLAY_PAGE = `${DOMAIN_FE}/dist/visualization.html`;
    PUBLIC_PAGE = `${DOMAIN_FE}/dist/publicMain.html`;

    DOMAIN_COMPONENT = "http://127.0.0.1:5501";

    FUNC1_COMP = `${DOMAIN_COMPONENT}/dist/function1Plot.html`;
}

if (process.env.RUN_ENV == "app") {
    DOMAIN_FE = "http://vezzzing.cn/GraphDoc/Main";

    EDITOR_PGAE = `${DOMAIN_FE}/dist/graphEditor.html`;
    USER_PAGE = `${DOMAIN_FE}/dist/userMain.html`;
    DISPLAY_PAGE = `${DOMAIN_FE}/dist/visualization.html`;
    PUBLIC_PAGE = `${DOMAIN_FE}/dist/publicMain.html`;
}
export {
    DOMAIN_RES,

    IMG_UPLOAD_PATH,
    IMG_STORE_PATH,
    FILE_UPLOAD_PATH,
    FILE_STORE_PATH,
    VIDEO_UPLOAD_PATH,
    VIDEO_STORE_PATH,
    GRAPH_SVG_UPLOAD_PATH,
    GRAPH_PNG_STORE_PATH,
    AVATAR_UPLOAD_PATH,
    AVATAR_STORE_PATH,


    DOMAIN_MAIN,

    USER_REGISTER,
    USER_LOGIN,
    USER_DATA,
    USER_AVATAR_ROOT,
    USER_LIST_GRAPH_PATH,
    USER_SAVE_GRAPH_TO_CLOUD,
    USER_LOAD_FROM_CLOUD,
    USER_DELETE_GRAPH,
    USER_ODATA,
    USER_UPDATE_AVATAR,
    USER_CONFIG_GRAPH,
    USER_LOAD_GRAPH_CONFIG,
    USER_GET_USERLIST,
    EXTRACT_TEXT,

    LIST_PUBLIC_GRAPH,

    DOMAIN_FE,

    EDITOR_PGAE,
    USER_PAGE,
    DISPLAY_PAGE,
    PUBLIC_PAGE,

    DOMAIN_COMPONENT,

    FUNC1_COMP,

    DOWNLOAD_LINK
}