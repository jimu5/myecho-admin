import axios from "../myaxios";

export class MosAPI {
    static baseAPIUrl = '/mos';

    static delete(id: number) {
        return axios.delete(`${MosAPI.baseAPIUrl}/${id}`)
    }

    static getList(page: number, page_size: number, name?: string) {
        if (!name) {
            name = ""
        }
        return axios.get(`${MosAPI.baseAPIUrl}/files`, { params: { page, page_size, name } })
    }
}