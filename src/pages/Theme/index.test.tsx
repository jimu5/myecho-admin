import React from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import Theme from './index';
import { ThemeApi } from '@/utils/apis/theme';
import { message } from 'antd';

jest.mock('@/utils/apis/theme', () => ({
  getThemeErrorMessage: (error: any) => error?.msg || error?.message || '未知错误',
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
    warning: jest.fn(),
  };

  const Upload = {
    Dragger: ({ customRequest, disabled, children }: any) => {
      const request = (file: File) => customRequest({
        file,
        onSuccess: jest.fn(),
        onError: jest.fn(),
        onProgress: jest.fn(),
      });
      const largeFile = new File(['zip'], 'large.zip', { type: 'application/zip' });
      Object.defineProperty(largeFile, 'size', { value: 21 * 1024 * 1024 });
      return (
        <div>
          <button disabled={disabled} onClick={() => request(new File(['zip'], 'theme.zip', { type: 'application/zip' }))}>
            upload theme
          </button>
          <button disabled={disabled} onClick={() => request(largeFile)}>upload large theme</button>
          <button disabled={disabled} onClick={() => request(new File(['text'], 'theme.txt'))}>upload text theme</button>
          {children}
        </div>
      );
    },
  };

  return {
    Button: ({ children, icon, loading, danger, type, ...props }: any) => (
      <button type="button" {...props}>
        {icon}
        {children}
      </button>
    ),
    Card: ({ children, loading }: any) => <section data-loading={String(loading)}>{children}</section>,
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
    Image: ({ preview, ...props }: any) => <img {...props} />,
    Progress: ({ percent }: any) => <div role="progressbar" aria-valuenow={percent} />,
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
    const previewColumn = columns.find((column: any) => column.dataIndex === 'preview');

    return (
      <div data-testid="theme-table" data-loading={String(loading)}>
        {value.map((record: any) => (
          <div data-testid={`theme-row-${record.id}`} key={record.id}>
            <span>{record.display_name}</span>
            <span>{record.name}</span>
            {previewColumn.render(null, record)}
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
    is_bundled: false,
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
    is_bundled: false,
    preview: '',
    css: 'body{}',
    js: '',
    config: { primaryColor: '#1890ff' },
  },
  {
    id: 3,
    name: 'anime',
    display_name: 'Anime Theme',
    author: 'Myecho',
    version: '1.0.0',
    description: 'Bundled theme',
    is_active: false,
    is_default: false,
    is_bundled: true,
    preview: '',
    css: '@import url("/static/css/presets/anime.css");',
    js: '',
    config: { bundled: true },
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
    expect(screen.getByText('3套')).toBeInTheDocument();
    expect(screen.getByText('当前主题')).toBeInTheDocument();
    expect(screen.getAllByText('Default Theme')[0]).toBeInTheDocument();
    expect(screen.getByText('ZIP')).toBeInTheDocument();
  });

  test('uploads a theme package and refreshes on success', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('upload theme'));

    await waitFor(() => expect(ThemeApi.upload).toHaveBeenCalledWith(expect.any(File), expect.any(Function)));
    await waitFor(() => expect(message.success).toHaveBeenCalledWith('主题包上传成功'));
    await waitFor(() => expect(ThemeApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('shows upload error when theme package upload fails', async () => {
    (ThemeApi.upload as jest.Mock).mockRejectedValueOnce(new Error('bad zip'));

    await renderTheme();
    fireEvent.click(screen.getByText('upload theme'));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('主题包上传失败：bad zip'));
    expect(ThemeApi.getAll).toHaveBeenCalledTimes(1);
  });

  test('shows upload progress and installation phase', async () => {
    let reportProgress: (percent: number) => void = () => undefined;
    let finishUpload: () => void = () => undefined;
    (ThemeApi.upload as jest.Mock).mockImplementation((_file, onProgress) => {
      reportProgress = onProgress;
      return new Promise<void>((resolve) => {
        finishUpload = resolve;
      });
    });

    await renderTheme();
    fireEvent.click(screen.getByText('upload theme'));
    await waitFor(() => expect(ThemeApi.upload).toHaveBeenCalled());

    act(() => reportProgress(50));
    expect(screen.getByText('正在上传主题包 50%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');

    act(() => reportProgress(100));
    expect(screen.getByText('上传完成，正在校验并安装主题…')).toBeInTheDocument();
    expect(screen.getByText('upload theme')).toBeDisabled();

    await act(async () => finishUpload());
    await waitFor(() => expect(message.success).toHaveBeenCalledWith('主题包上传成功'));
  });

  test('rejects invalid theme packages before upload', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('upload large theme'));
    expect(message.error).toHaveBeenCalledWith('主题包不能超过 20 MB');
    fireEvent.click(screen.getByText('upload text theme'));
    expect(message.error).toHaveBeenCalledWith('请选择 ZIP 格式的主题包');
    expect(ThemeApi.upload).not.toHaveBeenCalled();
  });

  test('treats upload timeout as an uncertain installation result', async () => {
    (ThemeApi.upload as jest.Mock).mockRejectedValueOnce({ code: 'ECONNABORTED' });

    await renderTheme();
    fireEvent.click(screen.getByText('upload theme'));

    await waitFor(() => expect(message.warning).toHaveBeenCalledWith('上传请求超时，主题可能仍在安装，请刷新确认后再重试'));
    expect(ThemeApi.getAll).toHaveBeenCalledTimes(2);
    expect(message.error).not.toHaveBeenCalledWith(expect.stringContaining('主题包上传失败'));
  });

  test('activates and deletes a non-active custom theme', async () => {
    await renderTheme();

    const customThemeRow = screen.getByTestId('theme-row-2');
    fireEvent.click(within(customThemeRow).getByText('应用'));

    await waitFor(() => expect(ThemeApi.activate).toHaveBeenCalledWith(2));
    expect(message.success).toHaveBeenCalledWith('主题激活成功，前台已立即切换');

    fireEvent.click(within(customThemeRow).getByText('删除'));

    await waitFor(() => expect(ThemeApi.delete).toHaveBeenCalledWith(2));
    expect(message.success).toHaveBeenCalledWith('删除成功');
    await waitFor(() => expect(ThemeApi.getAll).toHaveBeenCalledTimes(3));
  });

  test('keeps bundled themes customizable and previewable but protected from editing and deletion', async () => {
    await renderTheme();

    const bundledThemeRow = screen.getByTestId('theme-row-3');
    expect(within(bundledThemeRow).getByRole('img', { name: 'Anime Theme 主题预览' }))
      .toHaveAttribute('src', '/static/img/theme-previews/anime.jpg');
    expect(within(bundledThemeRow).getByText('应用')).toBeInTheDocument();
    expect(within(bundledThemeRow).getByText('预览')).toBeInTheDocument();
    expect(within(bundledThemeRow).getByText('定制')).toBeInTheDocument();
    expect(within(bundledThemeRow).queryByText('编辑')).not.toBeInTheDocument();
    expect(within(bundledThemeRow).queryByText('删除')).not.toBeInTheDocument();
  });

  test('uses bundled previews without replacing a custom theme preview', async () => {
    (ThemeApi.getAll as jest.Mock).mockResolvedValueOnce(
      themes.map((theme) => theme.id === 2 ? { ...theme, preview: '/uploads/clean.jpg' } : theme)
    );

    await renderTheme();

    expect(within(screen.getByTestId('theme-row-1')).getByRole('img', { name: 'Default Theme 主题预览' }))
      .toHaveAttribute('src', '/static/img/theme-previews/default.jpg');
    expect(within(screen.getByTestId('theme-row-2')).getByRole('img', { name: 'Clean Theme 主题预览' }))
      .toHaveAttribute('src', '/uploads/clean.jpg');
  });

  test('does not apply a bundled preview to a legacy custom theme with the same name', async () => {
    (ThemeApi.getAll as jest.Mock).mockResolvedValueOnce([
      ...themes,
      {
        ...themes[1],
        id: 4,
        name: 'paper',
        display_name: 'Custom Paper',
        preview: '',
      },
    ]);

    await renderTheme();

    expect(within(screen.getByTestId('theme-row-4')).queryByRole('img')).not.toBeInTheDocument();
  });

  test('opens create, config, and preview dialogs from toolbar and row actions', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('创建轻量主题'));
    expect(screen.getByRole('dialog', { name: 'create-theme' })).toBeInTheDocument();

    const customThemeRow = screen.getByTestId('theme-row-2');
    fireEvent.click(within(customThemeRow).getByText('定制'));
    expect(screen.getByRole('dialog', { name: 'config-theme' })).toHaveTextContent('Clean Theme');

    fireEvent.click(within(customThemeRow).getByText('预览'));
    expect(screen.getByRole('dialog', { name: 'preview-theme' })).toHaveTextContent('Clean Theme');
  });

  test('saves inline edits with ThemeApi.update', async () => {
    await renderTheme();

    fireEvent.click(screen.getByText('save edit 2'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalledWith(2, {
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

  test('keeps a successful write successful when list refresh fails', async () => {
    (ThemeApi.getAll as jest.Mock)
      .mockImplementationOnce(() => Promise.resolve(themes))
      .mockRejectedValueOnce(new Error('refresh failed'));

    await renderTheme();
    fireEvent.click(screen.getByText('save edit 2'));

    await waitFor(() => expect(ThemeApi.update).toHaveBeenCalled());
    expect(message.success).toHaveBeenCalledWith('保存成功');
    await waitFor(() => expect(message.warning).toHaveBeenCalledWith('操作已成功，但主题列表刷新失败，请手动刷新'));
    expect(message.error).not.toHaveBeenCalledWith(expect.stringContaining('保存失败'));
  });
});
