import baseReturn from "./baseReturn";
import axios from "../myaxios";

export interface settingModel extends baseReturn {
    key: string,
    value: string,
    type: string,
    is_system: boolean,
    is_public: boolean,
    description: string
}

export interface RestorePreview {
    version: number;
    exported_at: string;
    counts: {
        users: number;
        articles: number;
        article_details: number;
        article_revisions: number;
        article_slug_redirects: number;
        article_daily_stats: number;
        comments: number;
        categories: number;
        tags: number;
        links: number;
        files: number;
        themes: number;
        settings: number;
    };
    storage_files: number;
    storage_bytes: number;
    backup_path?: string;
    cleanup_warning?: string;
}

export class SettingApi {
    static baseApiUrl = "/settings";

    static get(key: string) {
        return axios.get(`${SettingApi.baseApiUrl}/${key}`);
    }
    static getAll() {
        return axios.get(SettingApi.baseApiUrl)
    }
    static getAdminAll() {
        return axios.get(`${SettingApi.baseApiUrl}/admin`)
    }
    static create(params: Pick<settingModel, 'key' | 'value' | 'type'> & Partial<Pick<settingModel, 'description' | 'is_public'>>) {
        return axios.post(SettingApi.baseApiUrl, params)
    }
    static updateValue(key: string, value: string, description: string, isPublic?: boolean) {
        return axios.patch(`${SettingApi.baseApiUrl}/${key}`, {
            value,
            description,
            ...(isPublic === undefined ? {} : { is_public: isPublic }),
        })
    }
    static delete(key: string) {
        return axios.delete(`${SettingApi.baseApiUrl}/${key}`)
    }
    static exportBackup(): Promise<Blob> {
        return axios.get<any, Blob>('/export', { responseType: 'blob', timeout: 0 })
    }
    static importBackup(file: File, dryRun: boolean): Promise<RestorePreview> {
        const form = new FormData();
        form.append('file', file);
        return axios.post('/import', form, {
            params: { dry_run: dryRun },
            timeout: 0,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    }
}
