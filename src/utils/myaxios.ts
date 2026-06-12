import axios from "axios";
import { notification } from "antd";
import { baseApiUrl } from "@/utils/config";
import { redirectToLogin } from "@/utils/navigation";

const instance = axios.create({
  baseURL: baseApiUrl,
  timeout: 10000,
});

interface ApiEnvelope<T = any> {
  code: number;
  msg: string;
  data: T;
  meta?: Record<string, any>;
}

const AUTH_ERROR_CODES = new Set([4011, 4033]);

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
    const payload = response.data;
    if (isApiEnvelope(payload)) {
      if (payload.code !== 0) {
        handleAuthFailure(payload.code);
        notification.error({
          message: '错误代码: ' + payload.code,
          description: payload.msg,
        });
        return Promise.reject(payload);
      }
      if (payload.meta && Object.keys(payload.meta).length > 0) {
        return { ...payload.meta, data: payload.data };
      }
      return payload.data;
    }
    return payload;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const responseData = error.response?.data || {};
    handleAuthFailure(getResponseCode(responseData), error.response?.status);
    notification.error({
      message: '错误代码: ' + (responseData.code || responseData.Code || error.response?.status || 'NETWORK'),
      description: responseData.msg || responseData.Msg || error.message,
    });
    return Promise.reject(error);
  }
);

function isApiEnvelope(payload: any): payload is ApiEnvelope {
  return payload
    && typeof payload === 'object'
    && typeof payload.code === 'number'
    && typeof payload.msg === 'string'
    && Object.prototype.hasOwnProperty.call(payload, 'data');
}

function getResponseCode(payload: any): number | undefined {
  const code = payload?.code ?? payload?.Code;
  if (typeof code === 'number') {
    return code;
  }
  if (typeof code === 'string') {
    const parsed = Number(code);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function handleAuthFailure(code?: number, status?: number) {
  if (status !== 401 && (code === undefined || !AUTH_ERROR_CODES.has(code))) {
    return;
  }
  localStorage.removeItem('user');
  if (window.location.pathname !== '/admin/login') {
    redirectToLogin();
  }
}

export default instance;
