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
  css: 'body { color: black; }',
  js: 'window.theme = true;',
} as unknown as themeModel;

describe('ModalConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateFields.mockResolvedValue({
      config: { primaryColor: '#222' },
      editor: {
        json: '{"extra":true}',
        css: 'body { color: blue; }',
        js: 'window.theme = "custom";',
      },
    });
    (ThemeApi.update as jest.Mock).mockResolvedValue({});
  });

  test('loads and saves schema fields, JSON, CSS, and JavaScript together', async () => {
    const setOpen = jest.fn();
    const okCallBack = jest.fn();

    render(<ModalConfig open={true} setOpen={setOpen} theme={theme} okCallBack={okCallBack} />);

    expect(mockSetFieldsValue).toHaveBeenCalledWith({
      config: theme.config,
      editor: {
        json: JSON.stringify(theme.config, null, 2),
        css: theme.css,
        js: theme.js,
      },
    });
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(9, {
      config: { extra: true, primaryColor: '#222' },
      css: 'body { color: blue; }',
      js: 'window.theme = "custom";',
    }));
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(okCallBack).toHaveBeenCalled();
  });

  test('closes without saving when cancelled', () => {
    const setOpen = jest.fn();

    render(<ModalConfig open={true} setOpen={setOpen} theme={theme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('cancel'));

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(ThemeApi.update).not.toHaveBeenCalled();
  });

  test('replaces schemaless JSON config so removed keys stay removed', async () => {
    const schemalessTheme = {
      ...theme,
      config: { keep: true, remove: true },
      config_schema: [],
    } as themeModel;
    mockValidateFields.mockResolvedValueOnce({
      editor: { json: '{"keep":true}', css: '', js: '' },
    });

    render(<ModalConfig open={true} setOpen={jest.fn()} theme={schemalessTheme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(9, {
      config: { keep: true },
      css: '',
      js: '',
    }));
  });

  test('rejects schemaless JSON values that are not objects', async () => {
    const schemalessTheme = { ...theme, config_schema: [] } as themeModel;
    mockValidateFields.mockResolvedValueOnce({ editor: { json: '[]' } });

    render(<ModalConfig open={true} setOpen={jest.fn()} theme={schemalessTheme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('JSON 配置必须是对象'));
    expect(ThemeApi.update).not.toHaveBeenCalled();
  });

  test('keeps schema keys separate from editor metadata', async () => {
    const collidingTheme = {
      ...theme,
      config: { __css: 'config value' },
      config_schema: [{ key: '__css', label: '配置 CSS', type: 'text' }],
    } as themeModel;
    mockValidateFields.mockResolvedValueOnce({
      config: { __css: 'updated config value' },
      editor: { json: '{"extra":true}', css: 'body {}', js: '' },
    });

    render(<ModalConfig open={true} setOpen={jest.fn()} theme={collidingTheme} okCallBack={jest.fn()} />);
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(9, {
      config: { extra: true, __css: 'updated config value' },
      css: 'body {}',
      js: '',
    }));
  });
});
