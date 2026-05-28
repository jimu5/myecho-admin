import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalConfig from './modalConfig';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

const mockValidateFields = jest.fn();
const mockSetFieldsValue = jest.fn();
const mockResetFields = jest.fn();

jest.mock('@/utils/apis/theme', () => ({
  ThemeApi: {
    updateConfig: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => {
  const Form = ({ children }: any) => <form>{children}</form>;
  Form.useForm = () => [
    {
      validateFields: mockValidateFields,
      setFieldsValue: mockSetFieldsValue,
      resetFields: mockResetFields,
    },
  ];
  Form.Item = ({ label, children }: any) => (
    <label>
      {label}
      {children}
    </label>
  );
  const Input = (props: any) => <input {...props} />;
  Input.TextArea = (props: any) => <textarea {...props} />;
  return {
    Modal: ({ title, open, onOk, onCancel, children }: any) =>
      open ? (
        <div>
          <h1>{title}</h1>
          <button onClick={onOk}>ok</button>
          <button onClick={onCancel}>cancel</button>
          {children}
        </div>
      ) : null,
    Form,
    Input,
    InputNumber: (props: any) => <input type="number" {...props} />,
    Switch: (props: any) => <input type="checkbox" {...props} />,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const theme = {
  id: 9,
  display_name: 'Clean Theme',
  config: { primaryColor: '#111' },
} as themeModel;

describe('ModalConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateFields.mockResolvedValue({ primaryColor: '#222' });
    (ThemeApi.updateConfig as jest.Mock).mockResolvedValue({});
  });

  test('loads theme config and saves updated config', async () => {
    const setOpen = jest.fn();
    const okCallBack = jest.fn();

    render(<ModalConfig open={true} setOpen={setOpen} theme={theme} okCallBack={okCallBack} />);

    expect(mockSetFieldsValue).toHaveBeenCalledWith(theme.config);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(ThemeApi.updateConfig).toHaveBeenCalledWith(9, { primaryColor: '#222' }));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(okCallBack).toHaveBeenCalled();
  });

  test('closes without saving when cancelled', () => {
    const setOpen = jest.fn();

    render(<ModalConfig open={true} setOpen={setOpen} theme={theme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('cancel'));

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(ThemeApi.updateConfig).not.toHaveBeenCalled();
  });
});
