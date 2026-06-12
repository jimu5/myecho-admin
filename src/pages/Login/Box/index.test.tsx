import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginBox from './index';
import { UserApi } from '@/utils/apis/user';
import { redirectToAdmin } from '@/utils/navigation';

jest.mock('react-redux', () => ({
  connect: () => (Component: React.ComponentType) => Component,
}));

jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    login: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/navigation', () => ({
  redirectToAdmin: jest.fn(),
}), { virtual: true });

describe('LoginBox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('logs in with username and stores user', async () => {
    (UserApi.login as jest.Mock).mockResolvedValue({ token: 'abc', nick_name: 'Admin', permission_type: 0 });

    render(<LoginBox />);
    fireEvent.change(screen.getByPlaceholderText('用户名或邮箱'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'secret' } });
    await act(async () => {
      fireEvent.click(screen.getAllByText('登录')[1]);
    });

    expect(UserApi.login).toHaveBeenCalledWith({ email: '', name: 'admin', password: 'secret' });
    await waitFor(() => expect(localStorage.getItem('user')).toContain('abc'));
    expect(redirectToAdmin).toHaveBeenCalledTimes(1);
  });

  test('logs in with email when input contains at sign', async () => {
    (UserApi.login as jest.Mock).mockResolvedValue({ token: 'email-token', permission_type: 0 });

    render(<LoginBox />);
    fireEvent.change(screen.getByPlaceholderText('用户名或邮箱'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'secret' } });
    await act(async () => {
      fireEvent.click(screen.getAllByText('登录')[1]);
    });

    expect(UserApi.login).toHaveBeenCalledWith({
      email: 'admin@example.com',
      name: '',
      password: 'secret',
    });
  });

  test('shows local error feedback when login fails', async () => {
    (UserApi.login as jest.Mock).mockRejectedValue({ msg: '账号或密码错误' });

    render(<LoginBox />);
    fireEvent.change(screen.getByPlaceholderText('用户名或邮箱'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'wrong' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: '登录' }).closest('form')!);
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('账号或密码错误'));
    expect(redirectToAdmin).not.toHaveBeenCalled();
  });

  test('keeps non-admin users on the login page', async () => {
    (UserApi.login as jest.Mock).mockResolvedValue({ token: 'normal-token', permission_type: 1 });

    render(<LoginBox />);
    fireEvent.change(screen.getByPlaceholderText('用户名或邮箱'), { target: { value: 'writer' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'secret' } });
    await act(async () => {
      fireEvent.submit(screen.getByRole('button', { name: '登录' }).closest('form')!);
    });

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('当前账号无后台管理权限'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(redirectToAdmin).not.toHaveBeenCalled();
  });
});
