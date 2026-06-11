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
    Sider: ({ children }: any) => <aside>{children}</aside>,
  },
  Menu: ({ items, onClick }: any) => {
    const flatten = (nextItems: any[]): any[] =>
      nextItems.flatMap((item) => [item, ...(item.children ? flatten(item.children) : [])]);
    return (
      <nav>
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
  });

  test('renders menu items and navigates by key', () => {
    render(<MySider />);

    fireEvent.click(screen.getByText('写文章'));

    expect(screen.getByText('仪表盘')).toBeInTheDocument();
    expect(screen.getByText('主题管理')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('article/write');
  });
});
