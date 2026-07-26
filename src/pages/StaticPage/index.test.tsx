import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import StaticPage from './index';
import { StaticPageApi } from '@/utils/apis/staticPage';
import { message } from 'antd';

jest.mock('@/utils/apis/staticPage', () => ({
  StaticPageApi: {
    getAll: jest.fn(),
    upload: jest.fn(),
    updateNavigation: jest.fn(),
    delete: jest.fn(),
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
    Dragger: ({ customRequest, children }: any) => (
      <div>
        <button
          onClick={() => customRequest({
            file: new File(['zip'], 'static-page.zip', { type: 'application/zip' }),
            onSuccess: jest.fn(),
            onError: jest.fn(),
          })}
        >
          upload static page
        </button>
        {children}
      </div>
    ),
  };

  const Table = ({ columns, dataSource, loading }: any) => {
    const actionColumn = columns.find((column: any) => column.key === 'actions');
    const navigationColumn = columns.find((column: any) => column.dataIndex === 'show_in_navigation');
    return (
      <div data-testid="static-page-table" data-loading={String(loading)}>
        {dataSource.map((record: any) => (
          <div data-testid={`static-page-row-${record.name}`} key={record.name}>
            <span>{record.display_name}</span>
            <span>{record.name}</span>
            <span>{record.url}</span>
            {navigationColumn.render(record.show_in_navigation, record)}
            {actionColumn.render(null, record)}
          </div>
        ))}
      </div>
    );
  };

  return {
    Button: ({ children, danger, icon, type, ...props }: any) => (
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
    Switch: ({ checked, onChange, loading }: any) => (
      <button disabled={loading} onClick={() => onChange(!checked)}>
        {checked ? 'navigation on' : 'navigation off'}
      </button>
    ),
    Tooltip: ({ children }: any) => <>{children}</>,
    Upload,
    Popconfirm: ({ children, onConfirm }: any) =>
      React.cloneElement(children, {
        onClick: onConfirm,
      }),
    Table,
    message,
  };
});

jest.mock('@ant-design/icons', () => ({
  DeleteOutlined: () => <span />,
  EyeOutlined: () => <span />,
  InboxOutlined: () => <span />,
  ReloadOutlined: () => <span />,
}));

const pages = [
  {
    name: 'campaign',
    display_name: 'Campaign',
    author: 'Codex',
    version: '1.0.0',
    description: 'Launch page',
    entry: 'index.html',
    url: '/static-pages/campaign/',
    asset_base_url: '/static-pages/campaign/',
    show_in_navigation: false,
    updated_at: '2026-06-16T00:00:00Z',
  },
];

const renderStaticPage = async () => {
  render(<StaticPage />);
  await screen.findByText('Campaign');
};

describe('StaticPage page', () => {
  const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

  beforeEach(() => {
    jest.clearAllMocks();
    (StaticPageApi.getAll as jest.Mock).mockResolvedValue(pages);
    (StaticPageApi.upload as jest.Mock).mockResolvedValue({});
    (StaticPageApi.updateNavigation as jest.Mock).mockResolvedValue({});
    (StaticPageApi.delete as jest.Mock).mockResolvedValue({});
  });

  afterAll(() => {
    openSpy.mockRestore();
  });

  test('loads static pages and renders summary statistics', async () => {
    await renderStaticPage();

    expect(StaticPageApi.getAll).toHaveBeenCalled();
    expect(screen.getByText('目录页面总数')).toBeInTheDocument();
    expect(screen.getByText('1个')).toBeInTheDocument();
    expect(screen.getByText('/static-pages')).toBeInTheDocument();
    expect(screen.getByText('ZIP')).toBeInTheDocument();
    expect(screen.getByText('/static-pages/campaign/')).toBeInTheDocument();
  });

  test('uploads a static page package and refreshes on success', async () => {
    await renderStaticPage();

    fireEvent.click(screen.getByText('upload static page'));

    await waitFor(() => expect(StaticPageApi.upload).toHaveBeenCalledWith(expect.any(File)));
    await waitFor(() => expect(message.success).toHaveBeenCalledWith('静态页面上传成功'));
    await waitFor(() => expect(StaticPageApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('shows upload error when static page package upload fails', async () => {
    (StaticPageApi.upload as jest.Mock).mockRejectedValueOnce(new Error('bad zip'));

    await renderStaticPage();
    fireEvent.click(screen.getByText('upload static page'));

    await waitFor(() => expect(message.error).toHaveBeenCalledWith('静态页面上传失败'));
    expect(StaticPageApi.getAll).toHaveBeenCalledTimes(1);
  });

  test('previews and deletes a static page', async () => {
    await renderStaticPage();

    const row = screen.getByTestId('static-page-row-campaign');
    fireEvent.click(within(row).getByText('预览'));
    expect(window.open).toHaveBeenCalledWith('/static-pages/campaign/', '_blank', 'noopener,noreferrer');

    fireEvent.click(within(row).getByText('删除'));

    await waitFor(() => expect(StaticPageApi.delete).toHaveBeenCalledWith('campaign'));
    expect(message.success).toHaveBeenCalledWith('删除成功');
    await waitFor(() => expect(StaticPageApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('adds a static page to the theme navigation', async () => {
    await renderStaticPage();

    const row = screen.getByTestId('static-page-row-campaign');
    fireEvent.click(within(row).getByText('navigation off'));

    await waitFor(() => expect(StaticPageApi.updateNavigation).toHaveBeenCalledWith('campaign', true));
    expect(message.success).toHaveBeenCalledWith('已加入主题导航');
    await waitFor(() => expect(StaticPageApi.getAll).toHaveBeenCalledTimes(2));
  });

  test('reports refresh failure without reporting a saved navigation change as failed', async () => {
    (StaticPageApi.getAll as jest.Mock)
      .mockResolvedValueOnce(pages)
      .mockRejectedValueOnce(new Error('refresh failed'));
    await renderStaticPage();

    const row = screen.getByTestId('static-page-row-campaign');
    fireEvent.click(within(row).getByText('navigation off'));

    await waitFor(() => expect(message.success).toHaveBeenCalledWith('已加入主题导航'));
    expect(message.warning).toHaveBeenCalledWith('导航设置已保存，但列表刷新失败，请手动刷新');
    expect(message.error).not.toHaveBeenCalledWith('导航设置更新失败');
  });

  test('does not expose inline editing controls', async () => {
    await renderStaticPage();

    const row = screen.getByTestId('static-page-row-campaign');
    expect(within(row).queryByText('编辑')).not.toBeInTheDocument();
    expect(within(row).queryByText('保存')).not.toBeInTheDocument();
  });
});
