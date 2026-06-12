import { notification } from 'antd';

jest.mock('@/utils/config', () => ({ baseApiUrl: '/api' }), { virtual: true });
jest.mock('@/utils/navigation', () => ({
  redirectToLogin: jest.fn(),
}));

import instance, { getAuthHeaders, getCurrentUser } from './myaxios';
import { redirectToLogin } from '@/utils/navigation';

describe('myaxios auth helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('reads current user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nick_name: 'Admin' }));

    expect(getCurrentUser()).toEqual({ token: 'abc', nick_name: 'Admin' });
  });

  test('builds token auth headers only when token exists', () => {
    expect(getAuthHeaders()).toEqual({});

    localStorage.setItem('user', JSON.stringify({ token: 'abc' }));
    expect(getAuthHeaders()).toEqual({ Authorization: 'token abc' });
  });

  test('request interceptor injects latest auth header', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'fresh' }));
    const handler = (instance.interceptors.request as any).handlers[0].fulfilled;

    const config = handler({ headers: { Existing: '1' } });

    expect(config.headers).toEqual({ Existing: '1', Authorization: 'token fresh' });
  });

  test('response interceptor unwraps envelopes and reports network errors safely', async () => {
    const successHandler = (instance.interceptors.response as any).handlers[0].fulfilled;
    expect(successHandler({ data: { ok: true } })).toEqual({ ok: true });
    expect(successHandler({ data: { code: 0, msg: 'ok', data: { id: 1 }, meta: {} } })).toEqual({ id: 1 });
    expect(successHandler({ data: { code: 0, msg: 'ok', data: [{ id: 1 }], meta: { total: 1, page: 1, page_size: 10 } } })).toEqual({
      total: 1,
      page: 1,
      page_size: 10,
      data: [{ id: 1 }],
    });

    const errorSpy = jest.spyOn(notification, 'error').mockImplementation(() => undefined as any);
    await expect(successHandler({ data: { code: 4031, msg: 'bad request', data: null, meta: {} } })).rejects.toEqual({
      code: 4031,
      msg: 'bad request',
      data: null,
      meta: {},
    });
    expect(errorSpy).toHaveBeenCalledWith({
      message: '错误代码: 4031',
      description: 'bad request',
    });

    const errorHandler = (instance.interceptors.response as any).handlers[0].rejected;

    await expect(errorHandler({ message: 'Network Error' })).rejects.toEqual({ message: 'Network Error' });
    expect(errorSpy).toHaveBeenCalledWith({
      message: '错误代码: NETWORK',
      description: 'Network Error',
    });
  });

  test('clears local user and redirects to login on auth failures', async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'stale' }));
    const errorSpy = jest.spyOn(notification, 'error').mockImplementation(() => undefined as any);
    const errorHandler = (instance.interceptors.response as any).handlers[0].rejected;

    await expect(errorHandler({
      response: {
        status: 403,
        data: { code: 4033, msg: '无权限' },
      },
    })).rejects.toEqual({
      response: {
        status: 403,
        data: { code: 4033, msg: '无权限' },
      },
    });

    expect(localStorage.getItem('user')).toBeNull();
    expect(redirectToLogin).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith({
      message: '错误代码: 4033',
      description: '无权限',
    });
  });
});
