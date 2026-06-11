import { baseApiUrl, myLocale, pageSize, siteName } from './config';
import reportWebVitals from '../reportWebVitals';
import { vditorUploadOptions } from './vditorConfg';

jest.mock('antd/es/locale/zh_CN', () => ({ locale: 'zh-cn' }));

jest.mock('./myaxios', () => ({
  getAuthHeaders: jest.fn(() => ({ Authorization: 'Bearer token' })),
}));

jest.mock('web-vitals', () => ({
  onCLS: jest.fn((cb) => cb('CLS')),
  onFCP: jest.fn((cb) => cb('FCP')),
  onINP: jest.fn((cb) => cb('INP')),
  onLCP: jest.fn((cb) => cb('LCP')),
  onTTFB: jest.fn((cb) => cb('TTFB')),
}));

describe('static config', () => {
  test('exports app config constants', () => {
    expect(baseApiUrl).toBe('/api');
    expect(pageSize).toBe(10);
    expect(siteName).toBe('管理后台');
    expect(myLocale.locale).toBe('zh-cn');
  });

  test('exports vditor upload options with auth headers', () => {
    expect(vditorUploadOptions).toMatchObject({
      url: '/mos/files/vditor_upload',
      headers: { Authorization: 'Bearer token' },
      linkToImgUrl: '/mos/save_url_file',
    });
  });

  test('creates redux store', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { store } = require('../redux/store');

    expect(store.getState()).toEqual({});
    consoleError.mockRestore();
  });

  test('skips web vitals when callback is omitted', () => {
    expect(() => reportWebVitals()).not.toThrow();
  });
});
