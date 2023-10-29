import windowIcon from "./../../asset/img/icon/icon.ico";

export function setWindowIcon() {
    document.querySelector(`link[rel="icon"]`).href = windowIcon;
}