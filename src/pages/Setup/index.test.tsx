import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Setup from './index';
import { UserApi } from '@/utils/apis/user';
import { redirectToAdmin } from '@/utils/navigation';

jest.mock('@/pages/Login/Box/index.module.scss', () => ({}), { virtual: true });

jest.mock('ahooks', () => {
  const setUser = jest.fn();
  return {
    useSafeState: jest.requireActual('react').useState,
    useLocalStorageState: () => [undefined, setUser],
    __setUser: setUser,
  };
}, { virtual: true });

jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    setupStatus: jest.fn(),
    setup: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/navigation', () => ({
  redirectToAdmin: jest.fn(),
  redirectToLogin: jest.fn(),
}), { virtual: true });

const { __setUser } = jest.requireMock('ahooks');

describe('Setup', () => {
  test('creates the first admin from the nested setup user response', async () => {
    (UserApi.setupStatus as jest.Mock).mockResolvedValue({ needs_setup: true });
    (UserApi.setup as jest.Mock).mockResolvedValue({
      needs_setup: false,
      user: { id: 1, name: 'admin', email: 'admin@example.com', token: 'token' },
    });

    render(<Setup />);

    fireEvent.change(await screen.findByLabelText('管理员用户名'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText('管理员邮箱'), { target: { value: 'admin@example.com' } });
    fireEvent.change(screen.getByLabelText('密码'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('确认密码'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: '开始使用' }));

    await waitFor(() => expect(UserApi.setup).toHaveBeenCalledWith({
      name: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      site_title: 'Myecho',
      site_description: '',
    }));
    expect(__setUser).toHaveBeenCalledWith(expect.objectContaining({ token: 'token' }));
    expect(redirectToAdmin).toHaveBeenCalledTimes(1);
  });
});
