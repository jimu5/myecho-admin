import { user } from "./myaxios";

export var vditorUploadOptions = {
    url: "/mos/files/vditor_upload",
    headers: {'Authorization': `token ${user.token}`},
    linkToImgUrl: "/mos/save_url_file",
}
