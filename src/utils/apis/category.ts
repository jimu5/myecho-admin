import axios from "../axios";
import baseReturn from "./baseReturn";

export interface category extends baseReturn {
  name: string;
  father_uid: string;
  uid: string;
  type: number;
}

export class CategoryApi {
  static baseApiUrl = "/categories"
  static articleCategoryApiUrl = "/article/categories";
  static linkCategoryApiUrl = "/link/categories";

  static getArticleList(): Promise<category[]> {
    return axios.get(CategoryApi.articleCategoryApiUrl + '/all');
  }
  static getLinkList(): Promise<category[]> {
    return axios.get(CategoryApi.linkCategoryApiUrl + '/all')
  }
  static get(id: number) {
    return axios.get(`${CategoryApi.baseApiUrl}/${id}`);
  }
  static createArticle(params: { name: string; father_uid: string | null }) {
    return axios.post(CategoryApi.articleCategoryApiUrl, {...params});
  }
  static patch(id: number, params: { name: string; father_id: number | null }) {
    return axios.patch(`${CategoryApi.baseApiUrl}/${id}`, params);
  }
  static delete(id: number) {
    return axios.delete(`${CategoryApi.baseApiUrl}/${id}`);
  }
}