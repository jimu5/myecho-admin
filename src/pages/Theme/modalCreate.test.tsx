import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalCreate from './modalCreate';
import { ThemeApi } from '@/utils/apis/theme';

const mockValidateFields = jest.fn();
const mockResetFields = jest.fn();

jest.mock('@/utils/apis/theme', () => ({
  ThemeApi: {
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
  Form: Object.assign(
    ({ children }: any) => <form>{children}</form>,
    {
      useForm: () => [{ validateFields: mockValidateFields, resetFields: mockResetFields }],
      Item: ({ children, label }: any) => (
        <label>
          {label}
          {children}
        </label>
      ),
    }
  ),
  Input: Object.assign(
    ({ placeholder }: any) => <input placeholder={placeholder} />,
    {
      TextArea: ({ placeholder }: any) => <textarea placeholder={placeholder} />,
    }
  ),
  message: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Theme modalCreate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateFields.mockResolvedValue({
      name: 'clean',
      display_name: 'Clean',
      author: 'Myecho',
      version: '1.0.0',
      description: 'Theme',
    });
    (ThemeApi.create as jest.Mock).mockResolvedValue({});
  });

  test('creates theme and resets modal state', async () => {
    const setOpen = jest.fn();
    const okCallBack = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={okCallBack} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() =>
      expect(ThemeApi.create).toHaveBeenCalledWith({
        name: 'clean',
        display_name: 'Clean',
        author: 'Myecho',
        version: '1.0.0',
        description: 'Theme',
        is_default: false,
        is_active: false,
        config: {},
      })
    );
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(mockResetFields).toHaveBeenCalled();
    expect(okCallBack).toHaveBeenCalled();
  });

  test('shows error when create fails and cancels cleanly', async () => {
    (ThemeApi.create as jest.Mock).mockRejectedValueOnce(new Error('bad'));
    const setOpen = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));
    await waitFor(() => expect(ThemeApi.create).toHaveBeenCalled());

    fireEvent.click(screen.getByText('cancel'));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(mockResetFields).toHaveBeenCalled();
  });
});
