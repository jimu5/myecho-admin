import axios from "axios";
import { notification } from "antd";
import { baseApiUrl } from "@/utils/config";

const instance = axios.create({
  baseURL: baseApiUrl,
  timeout: 10000,
});

export const getCurrentUser = () => JSON.parse(localStorage.getItem('user') || '{}');

export const getAuthHeaders = (): Record<string, string> => {
  const user = getCurrentUser();
  if (user.token) {
    return { Authorization: `token ${user.token}` };
  }
  return {};
};

// 全局拦截器
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    // 设置请求的 token 等等
    // config.headers["authorization"] = "Bearer " + getToken();
    if (config && config.headers) {
      Object.assign(config.headers, getAuthHeaders());
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
    const responseData = error.response?.data || {};
    notification.error({
      message: '错误代码: ' + (responseData.code || responseData.Code || error.response?.status || 'NETWORK'),
      description: responseData.msg || responseData.Msg || error.message,
    });
    return Promise.reject(error);
  }
);

export default instance;
