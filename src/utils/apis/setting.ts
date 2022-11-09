import baseReturn from "./baseReturn";
import axios from "../axios";

export interface settingModel extends baseReturn {
    key: string,
    value: string,
    type: string,
    is_system: boolean
}

export class SettingApi {
    static baseApiUrl = "/settings";

    static get(key: string) {
        return axios.get(`${SettingApi.baseApiUrl}/${key}`);
    }
    static getAll() {
        return axios.get(SettingApi.baseApiUrl)
    }
    static create(params: settingModel) {
        return axios.post(SettingApi.baseApiUrl, params)
    }
    static updateValue(key: string, value: String) {
        return axios.patch(`${SettingApi.baseApiUrl}/${key}`, {value: value})
    }
    static delete(key: string) {
        return axios.delete(`${SettingApi.baseApiUrl}/${key}`)
    }
}