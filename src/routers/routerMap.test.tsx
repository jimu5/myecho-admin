import routerMap from './routerMap';

jest.mock('./RequireAuth', () => () => null);

describe('routerMap', () => {
  test('defines admin shell, login and setup routes', () => {
    expect(routerMap).toHaveLength(3);
    expect(routerMap[0]).toMatchObject({ path: 'admin/*' });
    expect(routerMap[1]).toMatchObject({ path: 'admin/login', name: 'Login' });
    expect(routerMap[2]).toMatchObject({ path: 'admin/setup', name: 'Setup' });
  });
});
