import routerMap from './routerMap';

describe('routerMap', () => {
  test('defines admin shell and login routes', () => {
    expect(routerMap).toHaveLength(2);
    expect(routerMap[0]).toMatchObject({ path: 'admin/*' });
    expect(routerMap[1]).toMatchObject({ path: 'admin/login', name: 'Login' });
  });
});
