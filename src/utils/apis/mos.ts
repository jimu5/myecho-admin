import axios from "../myaxios";
import baseReturn from "./baseReturn";

export interface File extends baseReturn {
    full_name: string;
    uuid: string;
    extension_name: string;
    md5: string;
    url: string;
    note: string;
}

export class MosAPI {
    static baseAPIUrl = '/mos';

    static delete(id: number) {
        return axios.delete(`${MosAPI.baseAPIUrl}/files/${id}`, { baseURL: "" })
    }

    static getList(page: number, page_size: number, name?: string) {
        if (!name) {
            name = ""
        }
        return axios.get(`${MosAPI.baseAPIUrl}/files`, { params: { page, page_size, name }, baseURL: "" })
    }

    static Update(file: File) {
        return axios.put(`${MosAPI.baseAPIUrl}/files/${file.id}`, file, {baseURL: ""})
    }
}