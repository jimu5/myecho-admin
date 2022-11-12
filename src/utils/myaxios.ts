import axios from "axios";
import { notification } from "antd";
import { baseApiUrl } from "@/utils/config";

import { loginResponse } from './apis/user';

const instance = axios.create({
  baseURL: baseApiUrl,
  timeout: 10000,
});

export const user = JSON.parse(localStorage.getItem('user') || '{}') as loginResponse ;

// 全局拦截器
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // 设置请求的 token 等等
    // config.headers["authorization"] = "Bearer " + getToken();
    if (config && config.headers) {
      config.headers['Authorization'] = `token ${user.token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log(error)
    notification.error({
      message: '错误代码: ' + error.response.data.code,
      description: error.response.data.msg,
    });
    return Promise.reject(error);
  }
);

export default instance;
