import baseReturn from "./baseReturn";
import axios from "../myaxios";

export interface settingModel extends baseReturn {
    key: string,
    value: string,
    type: string,
    is_system: boolean,
    description: string
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
    static updateValue(key: string, value: String, description: string) {
        return axios.patch(`${SettingApi.baseApiUrl}/${key}`, {value: value})
    }
    static delete(key: string) {
        return axios.delete(`${SettingApi.baseApiUrl}/${key}`)
    }
}