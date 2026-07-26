import axios from '../myaxios';

export interface staticPageModel {
  name: string;
  display_name: string;
  author: string;
  version: string;
  description: string;
  entry: string;
  url: string;
  asset_base_url: string;
  show_in_navigation: boolean;
  updated_at: string;
}

export class StaticPageApi {
  static baseApiUrl = '/static-pages';

  static getAll() {
    return axios.get(StaticPageApi.baseApiUrl);
  }

  static upload(file: File | Blob) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${StaticPageApi.baseApiUrl}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
  }

  static delete(name: string) {
    return axios.delete(`${StaticPageApi.baseApiUrl}/${name}`);
  }

  static updateNavigation(name: string, showInNavigation: boolean) {
    return axios.patch(`${StaticPageApi.baseApiUrl}/${name}`, {
      show_in_navigation: showInNavigation,
    });
  }
}
