import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import MySider from './index';

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/admin/article/all' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

jest.mock('ahooks', () => {
  const React = require('react');
  return {
    useSafeState: React.useState,
  };
});

jest.mock('antd', () => ({
  Layout: {
    Sider: ({ children, collapsed, onBreakpoint, onCollapse }: any) => (
      <aside data-testid="admin-sider" data-collapsed={String(collapsed)}>
        <button aria-label="模拟移动断点" onClick={() => onBreakpoint(true)} />
        <button aria-label="切换侧栏" onClick={() => onCollapse(!collapsed, 'clickTrigger')} />
        {children}
      </aside>
    ),
  },
  Menu: ({ items, onClick, openKeys = [], selectedKeys = [] }: any) => {
    const flatten = (nextItems: any[]): any[] =>
      nextItems.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
    return (
      <nav data-open={openKeys.join(',')} data-selected={selectedKeys.join(',')}>
        {flatten(items).map((item) => (
          <button key={item.key} onClick={() => onClick({ key: item.key })}>
            {item.label}
          </button>
        ))}
      </nav>
    );
  },
}));

describe('MySider', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocation.pathname = '/admin/article/all';
  });

  test('renders menu items and navigates with absolute admin paths', () => {
    render(<MySider />);

    fireEvent.click(screen.getByText('写文章'));

    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('主题管理')).toBeInTheDocument();
    expect(screen.getByText('静态页面')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toHaveAttribute('data-open', 'article');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-selected', 'article/all');
    expect(screen.getByTestId('admin-sider')).toHaveAttribute('data-collapsed', 'false');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/article/write');
  });

  test('collapses on mobile and closes again after menu navigation', () => {
    render(<MySider />);

    const sider = screen.getByTestId('admin-sider');
    expect(sider).toHaveAttribute('data-collapsed', 'false');

    fireEvent.click(screen.getByRole('button', { name: '模拟移动断点' }));
    expect(sider).toHaveAttribute('data-collapsed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '切换侧栏' }));
    expect(sider).toHaveAttribute('data-collapsed', 'false');

    fireEvent.click(screen.getByText('写文章'));
    expect(sider).toHaveAttribute('data-collapsed', 'true');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/article/write');
  });

  test('selects the dashboard menu at the admin root', () => {
    mockLocation.pathname = '/admin';

    render(<MySider />);

    expect(screen.getByRole('navigation')).toHaveAttribute('data-open', '');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-selected', '/admin');
  });

  test('keeps the write menu selected while editing an article', () => {
    mockLocation.pathname = '/admin/article/write/42';

    render(<MySider />);

    expect(screen.getByRole('navigation')).toHaveAttribute('data-open', 'article');
    expect(screen.getByRole('navigation')).toHaveAttribute('data-selected', 'article/write');
  });

  test('keeps nested menu clicks from appending to the current route', () => {
    render(<MySider />);

    fireEvent.click(screen.getByText('所有文章'));
    fireEvent.click(screen.getByText('所有文章'));

    expect(mockNavigate).toHaveBeenNthCalledWith(1, '/admin/article/all');
    expect(mockNavigate).toHaveBeenNthCalledWith(2, '/admin/article/all');
  });

  test('navigates to static page management', () => {
    render(<MySider />);

    fireEvent.click(screen.getByText('静态页面'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/static-pages');
  });
});
