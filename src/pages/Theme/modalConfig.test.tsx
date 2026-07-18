import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalConfig from './modalConfig';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';
import { message } from 'antd';

const mockValidateFields = jest.fn();
const mockSetFieldsValue = jest.fn();
const mockResetFields = jest.fn();

jest.mock('@/utils/apis/theme', () => ({
  getThemeErrorMessage: (error: any) => error?.msg || error?.message || '未知错误',
  ThemeApi: {
    updateConfig: jest.fn(),
    update: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => {
  const Form: any = ({ children }: any) => <form>{children}</form>;
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
  const Input: any = (props: any) => <input {...props} />;
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
	    Select: (props: any) => <select {...props} />,
	    message: {
	      success: jest.fn(),
	      error: jest.fn(),
	      warning: jest.fn(),
	    },
  };
});

const theme = {
  id: 9,
  display_name: 'Clean Theme',
  config: { primaryColor: '#111' },
  config_schema: [{ key: 'primaryColor', label: '主色调', type: 'color' }],
} as unknown as themeModel;

describe('ModalConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateFields.mockResolvedValue({ primaryColor: '#222' });
    (ThemeApi.updateConfig as jest.Mock).mockResolvedValue({});
    (ThemeApi.update as jest.Mock).mockResolvedValue({});
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

  test('replaces schemaless JSON config so removed keys stay removed', async () => {
    const schemalessTheme = {
      ...theme,
      config: { keep: true, remove: true },
      config_schema: [],
    } as themeModel;
    mockValidateFields.mockResolvedValueOnce({ __json: '{"keep":true}' });

    render(<ModalConfig open={true} setOpen={jest.fn()} theme={schemalessTheme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(9, { config: { keep: true } }));
    expect(ThemeApi.updateConfig).not.toHaveBeenCalled();
  });

  test('rejects schemaless JSON values that are not objects', async () => {
    const schemalessTheme = { ...theme, config_schema: [] } as themeModel;
    mockValidateFields.mockResolvedValueOnce({ __json: '[]' });

    render(<ModalConfig open={true} setOpen={jest.fn()} theme={schemalessTheme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('JSON 配置必须是对象'));
    expect(ThemeApi.update).not.toHaveBeenCalled();
  });
});
