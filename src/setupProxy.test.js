const { createProxyMiddleware } = require('http-proxy-middleware');

const setupProxy = require('./setupProxy');

jest.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: jest.fn((path, options) => ({ path, options })),
}));

describe('setupProxy', () => {
  test('registers api and media proxies', () => {
    const app = { use: jest.fn() };

    setupProxy(app);

    expect(createProxyMiddleware).toHaveBeenCalledWith('/api/', expect.objectContaining({
      target: 'http://localhost:2999',
      changeOrigin: true,
      ws: true,
    }));
    expect(createProxyMiddleware).toHaveBeenCalledWith('/mos/', expect.objectContaining({
      target: 'http://localhost:2999',
      changeOrigin: true,
      ws: true,
    }));
    expect(app.use).toHaveBeenCalledTimes(2);
  });
});
