import axios from "../axios";
import baseReturn from "./baseReturn";

export interface Link extends baseReturn {
    name: string;
    description: string;
    url: string;
    icon_url: string;
    category_uid: string;
}

export class LinkAPI {
    static baseApiUrl = "/links"
    static getAll(category_uid?: string) {
        let url
        if (category_uid) {
            url = `${LinkAPI.baseApiUrl}?category_uid=${category_uid}`
        } else {
            url = `${LinkAPI.baseApiUrl}`
        }
        return axios.get(url)
    }
    static create(param: Link) {
        return axios.post(`${LinkAPI.baseApiUrl}`, param)
    }
    static put(id: number, param: Link) {
        return axios.put(`${LinkAPI.baseApiUrl}/${id}`, param)
    }
    static delete(id: number) {
        return axios.delete(`${LinkAPI.baseApiUrl}/${id}`)
    }
}