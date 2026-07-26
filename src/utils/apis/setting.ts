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
    static create(params: Pick<settingModel, 'key' | 'value' | 'type'> & Partial<Pick<settingModel, 'description'>>) {
        return axios.post(SettingApi.baseApiUrl, params)
    }
    static updateValue(key: string, value: string, description: string) {
        return axios.patch(`${SettingApi.baseApiUrl}/${key}`, {value, description})
    }
    static delete(key: string) {
        return axios.delete(`${SettingApi.baseApiUrl}/${key}`)
    }
    static exportBackup(): Promise<Blob> {
        return axios.get<any, Blob>('/export', { responseType: 'blob', timeout: 0 })
    }
}
