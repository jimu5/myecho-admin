import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import LoginBox from './index';
import { UserApi } from '@/utils/apis/user';

jest.mock('react-redux', () => ({
  connect: () => (Component: React.ComponentType) => Component,
}));

jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    login: jest.fn(),
  },
}), { virtual: true });

describe('LoginBox', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  test('logs in with username and stores user', async () => {
    (UserApi.login as jest.Mock).mockResolvedValue({ token: 'abc', nick_name: 'Admin' });

    render(<LoginBox />);
    fireEvent.change(screen.getByPlaceholderText('用户名或邮箱'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'secret' } });
    await act(async () => {
      fireEvent.click(screen.getAllByText('登录')[1]);
    });

    expect(UserApi.login).toHaveBeenCalledWith({ email: '', name: 'admin', password: 'secret' });
    await waitFor(() => expect(localStorage.getItem('user')).toContain('abc'));
    expect(window.location.href).toBe('/admin');
  });

  test('logs in with email when input contains at sign', async () => {
    (UserApi.login as jest.Mock).mockResolvedValue({ token: 'email-token' });

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
});
