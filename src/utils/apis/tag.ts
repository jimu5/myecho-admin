import axios from "axios";
import baseReturn from "./baseReturn"

export interface tag extends baseReturn {
  id: number;
  name: string;
}

export class TagApi {
  static getList(): Promise<tag[]> {
    return axios.get("/tags");
  }
  static get(id: number) {
    return axios.get(`/tags/${id}`);
  }
  static create(params: { name: string }) {
    return axios.post("/tags", params);
  }
  static patch(id: number, params: { name: string }) {
    return axios.patch(`/tags/${id}`, params);
  }
  static delete(id: number) {
    return axios.delete(`/tags/${id}`);
  }
}