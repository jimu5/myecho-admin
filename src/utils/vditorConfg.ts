import { getAuthHeaders } from "./myaxios";

export var vditorUploadOptions = {
    url: "/mos/files/vditor_upload",
    headers: getAuthHeaders(),
    linkToImgUrl: "/mos/save_url_file",
}
