import axios from "../axios";
import baseReturn from "./baseReturn";

export interface category extends baseReturn {
  name: string;
  father_id: number;
}

export class CategoryApi {
  static baseApiUrl = "/articles/categories";

  static getList(): Promise<category[]> {
    return axios.get(CategoryApi.baseApiUrl + '/all');
  }
  static get(id: number) {
    return axios.get(`${CategoryApi.baseApiUrl}/${id}`);
  }
  static create(params: { name: string; father_id: number | null }) {
    return axios.post(CategoryApi.baseApiUrl, params);
  }
  static patch(id: number, params: { name: string; father_id: number | null }) {
    return axios.patch(`${CategoryApi.baseApiUrl}/${id}`, params);
  }
  static delete(id: number) {
    return axios.delete(`${CategoryApi.baseApiUrl}/${id}`);
  }
}