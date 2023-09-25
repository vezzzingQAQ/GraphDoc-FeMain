import windowIcon from "./../../asset/img/icon/main.jpg";

export function setWindowIcon() {
    document.querySelector(`link[rel="icon"]`).href = windowIcon;
}