import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalCreate from './modalCreate';
import { SettingApi } from '@/utils/apis/setting';

jest.mock('@/utils/apis/setting', () => ({
  SettingApi: {
    create: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => ({
  Modal: ({ open, onOk, onCancel, children }: any) =>
    open ? (
      <div>
        <button onClick={onOk}>ok</button>
        <button onClick={onCancel}>cancel</button>
        {children}
      </div>
    ) : null,
  Space: ({ children }: any) => <div>{children}</div>,
  Input: ({ placeholder, onChange }: any) => (
    <input placeholder={placeholder} onChange={onChange} />
  ),
  message: {
    success: jest.fn(),
  },
}));

describe('Setting modalCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingApi.create as jest.Mock).mockResolvedValue({});
  });

  test('creates a setting and closes modal', async () => {
    const setOpen = jest.fn();
    const okCallBack = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={okCallBack} />);
    fireEvent.change(screen.getByPlaceholderText('设置 key'), { target: { value: 'SiteTitle' } });
    fireEvent.change(screen.getByPlaceholderText('设置 type'), { target: { value: 'string' } });
    fireEvent.change(screen.getByPlaceholderText('设置 value'), { target: { value: 'Myecho' } });
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() =>
      expect(SettingApi.create).toHaveBeenCalledWith({
        key: 'SiteTitle',
        type: 'string',
        value: 'Myecho',
      })
    );
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(okCallBack).toHaveBeenCalled();
  });

  test('closes without creating on cancel', () => {
    const setOpen = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('cancel'));

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(SettingApi.create).not.toHaveBeenCalled();
  });
});
