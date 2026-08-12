import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Myheader from './index';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('antd', () => {
  const Layout: any = ({ children }: any) => <div>{children}</div>;
  Layout.Header = ({ children }: any) => <header>{children}</header>;
  return {
    Layout,
    Dropdown: ({ overlay, children }: any) => (
      <div>
        {children}
        {overlay}
      </div>
    ),
    Space: ({ children }: any) => <span>{children}</span>,
    Menu: ({ items }: any) => (
      <div>
        {items.map((item: any) => (
          <div key={item.key}>{item.label}</div>
        ))}
      </div>
    ),
  };
});

jest.mock('@/utils/apis/user', () => ({
  UserApi: { logout: jest.fn().mockResolvedValue({ logged_out: true }) },
}));

const { UserApi: mockUserApi } = jest.requireMock('@/utils/apis/user');

describe('Myheader', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockUserApi.logout.mockClear();
  });

  test('shows current nickname and opens the profile page', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nick_name: 'Admin' }));

    render(<Myheader />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '当前外观：跟随系统，切换外观' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Admin，打开用户菜单' })).toBeInTheDocument();
    fireEvent.click(screen.getByText('个人资料'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/profile');
  });

  test('revokes the current token and clears local login state on logout', async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nick_name: 'Admin' }));

    render(<Myheader />);
    fireEvent.click(screen.getByText('退出'));

    await waitFor(() => expect(mockUserApi.logout).toHaveBeenCalledWith('abc'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login', { replace: true });
  });

  test('keeps the local session when server-side token revocation fails', async () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nick_name: 'Admin' }));
    mockUserApi.logout.mockRejectedValueOnce(new Error('network error'));

    render(<Myheader />);
    fireEvent.click(screen.getByText('退出'));

    await waitFor(() => expect(screen.getByText('退出')).toBeInTheDocument());
    expect(localStorage.getItem('user')).toContain('"token":"abc"');
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
