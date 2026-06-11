import React from 'react';
import { render, screen } from '@testing-library/react';

import MyContent from './Content';
import contentRoutes from './Content/routes';
import MyFooter from './Footer';
import Main from './Main';

const mockRouteCalls: any[] = [];

jest.mock('antd', () => {
  const Layout: any = ({ children }: any) => <div data-testid="layout">{children}</div>;
  Layout.Footer = ({ children }: any) => <footer>{children}</footer>;
  return { Layout };
});

jest.mock('antd/lib/layout/layout', () => ({
  Content: ({ children }: any) => <section>{children}</section>,
}));

jest.mock('react-router-dom', () => ({
  useRoutes: (routes: any) => {
    mockRouteCalls.push(routes);
    return <div>route-view</div>;
  },
}));

jest.mock('@/components/Sider', () => () => <aside>side</aside>, { virtual: true });
jest.mock('@/components/Header', () => () => <header>header</header>, { virtual: true });
jest.mock('@/components/Content', () => () => <section>content</section>, { virtual: true });
jest.mock('@/components/Footer', () => () => <footer>footer</footer>, { virtual: true });

describe('layout components', () => {
  beforeEach(() => {
    mockRouteCalls.length = 0;
  });

  test('renders content with configured routes', () => {
    render(<MyContent />);

    expect(screen.getByText('route-view')).toBeInTheDocument();
    expect(mockRouteCalls).toEqual([contentRoutes]);
    expect(contentRoutes.map(route => route.path)).toEqual([
      '',
      'article',
      'link',
      'mos',
      'comments',
      'setting',
      'theme',
    ]);
  });

  test('renders footer copy', () => {
    render(<MyFooter />);

    expect(screen.getByText('MyechoAdmin Created by Kimiato')).toBeInTheDocument();
  });

  test('renders main shell regions', () => {
    render(<Main />);

    expect(screen.getByText('side')).toBeInTheDocument();
    expect(screen.getByText('header')).toBeInTheDocument();
    expect(screen.getByText('content')).toBeInTheDocument();
    expect(screen.getByText('footer')).toBeInTheDocument();
  });
});
