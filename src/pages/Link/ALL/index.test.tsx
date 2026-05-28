import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import LinkALL from './index';
import { LinkAPI } from '@/utils/apis/link';

jest.mock('@/utils/apis/link', () => ({
  LinkAPI: {
    getAll: jest.fn(),
    delete: jest.fn(),
    put: jest.fn(),
  },
}), { virtual: true });

jest.mock('./modalCreate', () => ({ open, setOpen, okCallBack }: any) =>
  open ? (
    <div role="dialog">
      <span>mock create modal</span>
      <button
        onClick={() => {
          okCallBack();
          setOpen(false);
        }}
      >
        modal ok
      </button>
    </div>
  ) : null
);

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

jest.mock('antd', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Popconfirm: ({ children, onConfirm }: any) => (
    <span>
      {children}
      <button onClick={onConfirm}>confirm delete</button>
    </span>
  ),
  Space: ({ children }: any) => <span>{children}</span>,
  message: {
    success: jest.fn(),
  },
}));

jest.mock('@ant-design/pro-table', () => ({
  EditableProTable: ({ columns, value, editable, loading }: any) => {
    const actionColumn = columns.find((column: any) => column.key === 'actions');

    return (
      <div data-testid="link-table" data-loading={loading ? 'true' : 'false'}>
        {value.map((row: any) => (
          <div key={row.id}>
            <span>{row.name}</span>
            {actionColumn.render(null, row, 0, { startEditable: jest.fn() })}
            <button
              onClick={() =>
                editable.onSave(row.id, { ...row, name: `${row.name} edited` }, row)
              }
            >
              save {row.id}
            </button>
          </div>
        ))}
      </div>
    );
  },
}));

const renderLinkALL = async () => {
  await act(async () => {
    render(<LinkALL />);
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('LinkALL', () => {
  const links = [
    {
      id: 1,
      name: 'Go',
      description: 'Go site',
      url: 'https://go.dev',
      icon_url: 'https://go.dev/icon.png',
      category_uid: 'root',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (LinkAPI.getAll as jest.Mock).mockResolvedValue(links);
    (LinkAPI.delete as jest.Mock).mockResolvedValue({});
    (LinkAPI.put as jest.Mock).mockResolvedValue({});
  });

  test('loads and renders link list', async () => {
    await renderLinkALL();

    await waitFor(() => expect(LinkAPI.getAll).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Go')).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByTestId('link-table')).toHaveAttribute('data-loading', 'false')
    );
  });

  test('opens create modal from create button', async () => {
    await renderLinkALL();
    await screen.findByText('Go');

    await act(async () => {
      fireEvent.click(screen.getByText('创建新的'));
    });

    expect(screen.getByRole('dialog')).toHaveTextContent('mock create modal');
  });

  test('refreshes list after deleting a link', async () => {
    (LinkAPI.getAll as jest.Mock)
      .mockResolvedValueOnce(links)
      .mockResolvedValueOnce([
        {
          ...links[0],
          id: 2,
          name: 'Rust',
        },
      ]);

    await renderLinkALL();
    await screen.findByText('Go');

    await act(async () => {
      fireEvent.click(screen.getByText('confirm delete'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(LinkAPI.delete).toHaveBeenCalledWith(1));
    await waitFor(() => expect(LinkAPI.getAll).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Rust')).toBeInTheDocument();
  });

  test('saves edited link through LinkAPI.put', async () => {
    await renderLinkALL();
    await screen.findByText('Go');

    fireEvent.click(screen.getByText('save 1'));

    await waitFor(() =>
      expect(LinkAPI.put).toHaveBeenCalledWith(1, {
        ...links[0],
        name: 'Go edited',
      })
    );
  });
});
