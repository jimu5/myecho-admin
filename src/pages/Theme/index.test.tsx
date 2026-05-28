import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import Theme from './index';
import { ThemeApi } from '@/utils/apis/theme';
import { message } from 'antd';

jest.mock('@/utils/apis/theme', () => ({
  ThemeApi: {
    getAll: jest.fn(),
    upload: jest.fn(),
    activate: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
}), { virtual: true });

jest.mock('ahooks', () => {
  const React = require('react');

  return {
    useSafeState: React.useState,
    useRequest: (service: any) => {
      const serviceRef = React.useRef(service);
      serviceRef.current = service;
      const runAsync = React.useCallback(async () => {
        return serviceRef.current();
      }, []);

      React.useEffect(() => {
        runAsync();
      }, []);

      return { runAsync, loading: false };
    },
  };
});

jest.mock('antd', () => {
  const React = require('react');
  const message = {
    success: jest.fn(),
    error: jest.fn(),
  };

  const Upload = {
    Dragger: ({ customRequest, children }: any) => (
      <div>
        <button
          onClick={() => customRequest({
            file: new File(['zip'], 'theme.zip', { type: 'application/zip' }),
            onSuccess: jest.fn(),
            onError: jest.fn(),
          })}
        >
          upload theme
        </button>
        {children}
      </div>
    ),
  };

  return {
    Button: ({ children, icon, ...props }: any) => (
      <button {...props}>
        {icon}
        {children}
      </button>
    ),
    Card: ({ children }: any) => <section>{children}</section>,
    Col: ({ children }: any) => <div>{children}</div>,
    Row: ({ children }: any) => <div>{children}</div>,
    Space: ({ children }: any) => <span>{children}</span>,
    Statistic: ({ title, value, suffix }: any) => (
      <div>
        <span>{title}</span>
        <strong>
          {value}
          {suffix}
        </strong>
      </div>
    ),
    Tag: ({ children }: any) => <span>{children}</span>,
    Tooltip: ({ children }: any) => <>{children}</>,
    Upload,
    Popconfirm: ({ children, onConfirm, disabled }: any) =>
      React.cloneElement(children, {
        onClick: disabled ? undefined : onConfirm,
      }),
    message,
  };
});

jest.mock('@ant-design/icons', () => ({
  InboxOutlined: () => <span />,
  PlusOutlined: () => <span />,
  ReloadOutlined: () => <span />,
}));

jest.mock('@ant-design/pro-table', () => ({
  EditableProTable: ({ columns, value, editable, loading }: any) => {
    const actionColumn = columns.find((column: any) => column.key === 'actions');

    return (
      <div data-testid="theme-table" data-loading={String(loading)}>
        {value.map((record: any) => (
          <div data-testid={`theme-row-${record.id}`} key={record.id}>
            <span>{record.display_name}</span>
            <span>{record.name}</span>
            {actionColumn.render(null, record, 0, {
              startEditable: jest.fn(),
            })}
            <button
              onClick={() => editable.onSave(record.id, {
                ...record,
                display_name: `${record.display_name} Edited`,
                description: `${record.description} Edited`,
              }, record)}
            >
              save edit {record.id}
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

jest.mock('./modalCreate', () => ({ open, setOpen, okCallBack }: any) =>
  open ? (
    <div role="dialog" aria-label="create-theme">
      <button onClick={() => {
        setOpen(false);
        okCallBack();
      }}>
        close create
      </button>
    </div>
  ) : null
);

jest.mock('./modalConfig', () => ({ open, setOpen, theme, okCallBack }: any) =>
  open ? (
    <div role="dialog" aria-label="config-theme">
      <span>{theme?.display_name}</span>
      <button onClick={() => {
        setOpen(false);
        okCallBack();
      }}>
        close config
      </button>
    </div>
  ) : null
);

jest.mock('./modalPreview', () => ({ open, setOpen, theme }: any) =>
  open ? (
    <div role="dialog" aria-label="preview-theme">
      <span>{theme?.display_name}</span>
      <button onClick={() => setOpen(false)}>close preview</button>
    </div>
  ) : null
);

const themes = [
  {
    id: 1,
    name: 'default',
    display_name: 'Default Theme',
    author: 'Myecho',
    version: '1.0.0',
    description: 'Built in theme',
    is_active: true,
    is_default: true,
    preview: '',
    css: '',
    js: '',
    config: {},
  },
  {
    id: 2,
    name: 'clean',
    display_name: 'Clean Theme',
    author: 'Myecho',
    version: '1.1.0',
    description: 'Clean theme',
    is_active: false,
    is_default: false,
    preview: '',
    css: 'body{}',
    js: '',
    config: { primaryColor: '#1890ff' },
  },
];

const renderTheme = async () => {
  render(<Theme />);
  await screen.findByText('Clean Theme');
};

describe('Theme page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ThemeApi.getAll as jest.Mock).mockImplementation(() => ({
      then: (resolve: any) => {
        resolve(themes);
        return Promise.resolve();
      },
    }));
    (ThemeApi.upload as jest.Mock).mockResolvedValue({});
    (ThemeApi.activate as jest.Mock).mockResolvedValue({});
    (ThemeApi.delete as jest.Mock).mockResolvedValue({});
    (ThemeApi.update as jest.Mock).mockResolvedValue({});
  });

  test('loads themes and renders summary statistics', async () => {
    await renderTheme();

    expect(ThemeApi.getAll).toHaveBeenCalled();
    expect(screen.getByText('主题总数')).toBeInTheDocument();
    expect(screen.getByText('2套')).toBeInTheDocument();
    expect(screen.getByText('当前主题')).toBeInTheDocument();
    expect(screen.getAllByText('Default Theme')[0]).toBeInTheDocument();
    expect(screen.getByText('ZIP')).toBeInTheDocument();
  });

  test('uploads a theme package and refreshes on success', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('upload theme'));

    await waitFor(() => expect(ThemeApi.upload).toHaveBeenCalledWith(expect.any(File)));
    await waitFor(() => expect(message.success).toHaveBeenCalledWith('主题包上传成功'));
    await waitFor(() => expect(ThemeApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('shows upload error when theme package upload fails', async () => {
    (ThemeApi.upload as jest.Mock).mockRejectedValueOnce(new Error('bad zip'));

    await renderTheme();
    fireEvent.click(screen.getByText('upload theme'));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('主题包上传失败'));
    expect(ThemeApi.getAll).toHaveBeenCalledTimes(1);
  });

  test('activates and deletes a non-active custom theme', async () => {
    await renderTheme();

    const customThemeRow = screen.getByTestId('theme-row-2');
    fireEvent.click(within(customThemeRow).getByText('应用'));

    await waitFor(() => expect(ThemeApi.activate).toHaveBeenCalledWith(2));
    expect(message.success).toHaveBeenCalledWith('主题激活成功');

    fireEvent.click(within(customThemeRow).getByText('删除'));

    await waitFor(() => expect(ThemeApi.delete).toHaveBeenCalledWith(2));
    expect(message.success).toHaveBeenCalledWith('删除成功');
    await waitFor(() => expect(ThemeApi.getAll).toHaveBeenCalledTimes(3));
  });

  test('opens create, config, and preview dialogs from toolbar and row actions', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('创建主题'));
    expect(screen.getByRole('dialog', { name: 'create-theme' })).toBeInTheDocument();

    const customThemeRow = screen.getByTestId('theme-row-2');
    fireEvent.click(within(customThemeRow).getByText('配置'));
    expect(screen.getByRole('dialog', { name: 'config-theme' })).toHaveTextContent('Clean Theme');

    fireEvent.click(within(customThemeRow).getByText('预览'));
    expect(screen.getByRole('dialog', { name: 'preview-theme' })).toHaveTextContent('Clean Theme');
  });

  test('saves inline edits with ThemeApi.update', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('save edit 2'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(2, {
      name: 'clean',
      display_name: 'Clean Theme Edited',
      author: 'Myecho',
      version: '1.1.0',
      description: 'Clean theme Edited',
      preview: '',
      css: 'body{}',
      js: '',
    }));
    expect(message.success).toHaveBeenCalledWith('保存成功');
  });
});
