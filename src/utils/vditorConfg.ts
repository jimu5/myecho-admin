import { user } from "./axios";

export var vditorUploadOptions = {
    url: "/mos/upload",
    headers: {'Authorization': `token ${user.token}`}
}
