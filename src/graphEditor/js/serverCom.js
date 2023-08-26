import axios from "axios";
import { getCookie } from "../../public/js/tools";
import { USER_DATA } from "./graph/urls";

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
        document.querySelector("#showUsername").innerHTML = d.data.username;
    });
}