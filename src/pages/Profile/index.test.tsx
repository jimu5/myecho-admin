import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import Profile from './index';
import { UserApi } from '@/utils/apis/user';

jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    profile: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
  },
}), { virtual: true });

jest.mock('ahooks', () => ({
  useLocalStorageState: () => [undefined, jest.fn()],
  useSafeState: jest.requireActual('react').useState,
}));

jest.mock('antd', () => {
  let formIndex = 0;
  const Form: any = ({ children, onFinish }: any) => {
    const index = jest.requireActual('react').useRef(++formIndex).current;
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onFinish(index % 2 === 1
            ? { nick_name: 'Admin', email: 'admin@example.com' }
            : { old_password: 'old-pass', new_password: 'new-pass-123', confirm_password: 'new-pass-123' });
        }}
      >
        {children}
      </form>
    );
  };
  Form.useForm = () => [{ setFieldsValue: jest.fn(), resetFields: jest.fn() }];
  Form.Item = ({ children, label }: any) => <label>{label}{children}</label>;
  const Input: any = (props: any) => <input {...props} />;
  Input.Password = (props: any) => <input type="password" {...props} />;

  return {
    Button: ({ children, htmlType }: any) => <button type={htmlType}>{children}</button>,
    Col: ({ children }: any) => <div>{children}</div>,
    Form,
    Input,
    message: { success: jest.fn() },
    Row: ({ children }: any) => <div>{children}</div>,
  };
});

describe('Profile', () => {
  test('loads and updates profile and password', async () => {
    const user = { name: 'admin', nick_name: 'Admin', email: 'admin@example.com', token: 'next' };
    (UserApi.profile as jest.Mock).mockResolvedValue(user);
    (UserApi.updateProfile as jest.Mock).mockResolvedValue(user);
    (UserApi.updatePassword as jest.Mock).mockResolvedValue(user);

    render(<Profile />);

    await waitFor(() => expect(UserApi.profile).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: '保存资料' }));
    fireEvent.click(screen.getByRole('button', { name: '更新密码' }));

    await waitFor(() => expect(UserApi.updateProfile).toHaveBeenCalledWith({
      nick_name: 'Admin',
      email: 'admin@example.com',
    }));
    expect(UserApi.updatePassword).toHaveBeenCalledWith({
      old_password: 'old-pass',
      new_password: 'new-pass-123',
    });
  });
});
