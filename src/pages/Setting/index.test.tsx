import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Setting from './index';
import { SettingApi } from '@/utils/apis/setting';

jest.mock('@/utils/apis/setting', () => ({
  SettingApi: {
    getAll: jest.fn(),
    create: jest.fn(),
    updateValue: jest.fn(),
    delete: jest.fn(),
    exportBackup: jest.fn(),
  },
}), { virtual: true });

jest.mock('./modalCreate', () => ({ open, okCallBack }: any) => (
  <div>
    <span>{open ? 'modal open' : 'modal closed'}</span>
    <button onClick={() => okCallBack()}>modal callback</button>
  </div>
));

jest.mock('ahooks', () => {
  const React = require('react');

  return {
    useSafeState: React.useState,
    useRequest: (service: any) => {
      const serviceRef = React.useRef(service);
      const [loading, setLoading] = React.useState(true);
      serviceRef.current = service;

      const runAsync = React.useCallback(() => {
        setLoading(true);
        return Promise.resolve(serviceRef.current()).finally(() => setLoading(false));
      }, []);

      React.useEffect(() => {
        runAsync();
      }, [runAsync]);

      return { runAsync, loading };
    },
  };
});

jest.mock('@ant-design/pro-table', () => ({
  EditableProTable: ({ value, editable, columns, onChange }: any) => {
    const first = value[0];

    return (
      <div>
        <span data-testid="setting-count">{value.length}</span>
        {first && (
          <>
            <button onClick={() => editable.onSave(1, first, first)}>save setting</button>
            <button onClick={() => onChange([{ ...first, value: 'changed' }])}>change table</button>
            <div data-testid="setting-actions">
              {columns[4].render(null, first, 0, { startEditable: jest.fn() })}
            </div>
          </>
        )}
      </div>
    );
  },
}));

jest.mock('antd', () => {
  const React = require('react');
  const values: Record<string, string> = {};
  const form = {
    setFieldsValue: jest.fn((nextValues: Record<string, string>) => Object.assign(values, nextValues)),
    validateFields: jest.fn(() => Promise.resolve({ ...values })),
  };
  const Form: any = ({ children, onFinish }: any) => (
    <form onSubmit={(event) => {
      event.preventDefault();
      onFinish();
    }}>
      {children}
    </form>
  );
  Form.useForm = () => [form];
  Form.Item = ({ children, label }: any) => <label><span>{label}</span>{children}</label>;
  const Input: any = (props: any) => <input {...props} />;
  Input.TextArea = (props: any) => <textarea {...props} />;

  return {
    Button: ({ children, onClick, htmlType, loading }: any) => (
      <button type={htmlType === 'submit' ? 'submit' : 'button'} disabled={loading} onClick={onClick}>{children}</button>
    ),
    Col: ({ children }: any) => <div>{children}</div>,
    Form,
    Input,
    Row: ({ children }: any) => <div>{children}</div>,
    Space: ({ children }: any) => <div>{children}</div>,
    Tabs: ({ items }: any) => <div>{items.map((item: any) => <section key={item.key}>{item.label}{item.children}</section>)}</div>,
    Popconfirm: ({ children, onConfirm }: any) => (
      <span onClick={onConfirm}>{children}</span>
    ),
    message: {
      success: jest.fn(),
    },
  };
});

const renderSetting = async () => {
  await act(async () => {
    render(<Setting />);
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('Setting page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingApi.getAll as jest.Mock).mockResolvedValue([
      { id: 1, key: 'SiteTitle', value: 'Myecho', description: '站点标题说明', type: 'string', is_system: true },
      { id: 2, key: 'CustomKey', value: 'custom', description: 'custom', type: 'string', is_system: false },
    ]);
    (SettingApi.create as jest.Mock).mockResolvedValue({});
    (SettingApi.updateValue as jest.Mock).mockResolvedValue({});
    (SettingApi.delete as jest.Mock).mockResolvedValue({});
    (SettingApi.exportBackup as jest.Mock).mockResolvedValue(new Blob(['backup']));
  });

  test('loads basic settings and preserves their descriptions when saving', async () => {
    await renderSetting();

    await waitFor(() => expect(screen.getByTestId('setting-count')).toHaveTextContent('1'));
    expect(screen.getByText('站点名称')).toBeInTheDocument();
    expect(screen.getByText('站点描述')).toBeInTheDocument();
    expect(screen.getByText('作者简介')).toBeInTheDocument();
    expect(screen.getByText('站点地址')).toBeInTheDocument();
    fireEvent.click(screen.getByText('保存基础设置'));

    await waitFor(() => expect(SettingApi.updateValue).toHaveBeenCalledWith('SiteTitle', 'Myecho', '站点标题说明'));
    expect(SettingApi.create).toHaveBeenCalledWith(expect.objectContaining({
      key: 'SiteDescription',
      description: '站点描述',
    }));
    await waitFor(() => expect(SettingApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('deletes a setting and refreshes list', async () => {
    await renderSetting();

    await waitFor(() => expect(screen.getByTestId('setting-actions')).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText('删除'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(SettingApi.delete).toHaveBeenCalledWith('CustomKey'));
    expect(SettingApi.getAll).toHaveBeenCalledTimes(2);
  });

  test('opens create modal and wires callback to refresh', async () => {
    await renderSetting();

    expect(screen.getByText('modal closed')).toBeInTheDocument();
    fireEvent.click(screen.getByText('创建自定义设置'));

    expect(screen.getByText('modal open')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('modal callback'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(SettingApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('downloads an exported backup', async () => {
    const createObjectURL = jest.fn(() => 'blob:backup');
    const revokeObjectURL = jest.fn();
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: revokeObjectURL });
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    await renderSetting();

    fireEvent.click(screen.getByText('导出备份'));

    await waitFor(() => expect(SettingApi.exportBackup).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:backup');

    click.mockRestore();
  });
});
