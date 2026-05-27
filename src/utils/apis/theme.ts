import baseReturn from './baseReturn';
import axios from '../myaxios';

interface ThemeConfig {
  [key: string]: any;
}

export interface themeModel extends baseReturn {
  id: number;
  name: string;
  display_name: string;
  author: string;
  version: string;
  description: string;
  preview: string;
  css: string;
  js: string;
  is_default: boolean;
  is_active: boolean;
  config: ThemeConfig;
}

export class ThemeApi {
  static baseApiUrl = '/themes';

  // 获取所有主题
  static getAll() {
    return axios.get(ThemeApi.baseApiUrl);
  }

  // 获取单个主题
  static get(id: number) {
    return axios.get(`${ThemeApi.baseApiUrl}/${id}`);
  }

  // 创建主题
  static create(params: Partial<themeModel>) {
    return axios.post(ThemeApi.baseApiUrl, params);
  }

  // 上传主题压缩包
  static upload(file: File | Blob) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${ThemeApi.baseApiUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
  }

  // 更新主题
  static update(id: number, params: Partial<themeModel>) {
    return axios.patch(`${ThemeApi.baseApiUrl}/${id}`, params);
  }

  // 删除主题
  static delete(id: number) {
    return axios.delete(`${ThemeApi.baseApiUrl}/${id}`);
  }

  // 激活主题
  static activate(id: number) {
    return axios.post(`${ThemeApi.baseApiUrl}/${id}/activate`);
  }

  // 获取当前激活的主题
  static getActive() {
    return axios.get(`${ThemeApi.baseApiUrl}/active`);
  }

  // 更新主题配置
  static updateConfig(id: number, config: ThemeConfig) {
    return axios.patch(`${ThemeApi.baseApiUrl}/${id}/config`, config);
  }
}
