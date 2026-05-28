import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import FileAll from './index';
import { MosAPI } from '@/utils/apis/mos';

const tableRows = [
  {
    id: 1,
    full_name: 'avatar.png',
    uuid: 'uuid-1',
    extension_name: 'png',
    md5: 'md5-1',
    url: '/assets/avatar.png',
    note: 'old note',
    created_at: '2024-01-02T03:04:05Z',
  },
];

jest.mock('@/utils/apis/mos', () => ({
  MosAPI: {
    getList: jest.fn(),
    delete: jest.fn(),
    Update: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/image_tool', () => ({
  isAssetTypeAnImage: jest.fn(() => true),
}), { virtual: true });

jest.mock('@ant-design/icons', () => ({
  PaperClipOutlined: () => <span>clip icon</span>,
}));

jest.mock('antd', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Image: ({ src }: any) => <img alt="preview" src={src} />,
  Popconfirm: ({ children, onConfirm }: any) => (
    <span onClick={onConfirm}>{children}</span>
  ),
  Space: ({ children }: any) => <div>{children}</div>,
  message: {
    success: jest.fn(),
  },
}));

jest.mock('ahooks', () => {
  const React = require('react');

  return {
    useSafeState: React.useState,
    usePagination: (service: any) => {
      const [data, setData] = React.useState();
      const [loading, setLoading] = React.useState(true);
      const [page, setPage] = React.useState({ current: 1, pageSize: 10, name: '' });
      const pageRef = React.useRef(page);

      const load = React.useCallback((params: any) => {
        setLoading(true);
        return service(params).then((nextData: any) => {
          setData(nextData);
          setLoading(false);
          return nextData;
        });
      }, []);

      React.useEffect(() => {
        load(page);
      }, []);

      return {
        data,
        loading,
        refresh: () => service(pageRef.current),
        pagination: {
          current: page.current,
          pageSize: page.pageSize,
          onChange: (current: number, pageSize: number, name = 'logo') => {
            const nextPage = { current, pageSize, name };
            pageRef.current = nextPage;
            setPage(nextPage);
            return service(nextPage);
          },
        },
      };
    },
  };
});

jest.mock('@ant-design/pro-table', () => ({
  EditableProTable: ({ value = [], loading, columns, editable, pagination }: any) => {
    const firstRow = value[0] || tableRows[0];
    const actionColumn = columns.find((column: any) => column.key === 'action');

    return (
      <div>
        <span data-testid="loading">{String(loading)}</span>
        <span data-testid="total">{pagination.total || 0}</span>
        <span data-testid="current">{pagination.current}</span>
        <span data-testid="page-size">{pagination.pageSize}</span>
        <span data-testid="file-name">{firstRow.full_name}</span>
        <span data-testid="file-note">{firstRow.note}</span>
        <button onClick={() => pagination.onChange(2, 20, 'logo')}>page with search</button>
        <button onClick={() => editable.onSave(firstRow.id, { ...firstRow, note: 'updated note' }, firstRow)}>
          save file
        </button>
        {actionColumn.render(null, firstRow, 0, { startEditable: jest.fn() })}
      </div>
    );
  },
}));

describe('FileAll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (MosAPI.getList as jest.Mock).mockResolvedValue({
      total: 1,
      data: tableRows,
    });
    (MosAPI.delete as jest.Mock).mockResolvedValue({});
    (MosAPI.Update as jest.Mock).mockResolvedValue({});
  });

  test('loads file list and renders table data', async () => {
    render(<FileAll />);

    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(1, 10, ''));
    await waitFor(() => expect(screen.getByTestId('total')).toHaveTextContent('1'));
    expect(screen.getByTestId('file-name')).toHaveTextContent('avatar.png');
    expect(screen.getByTestId('file-note')).toHaveTextContent('old note');
  });

  test('passes pagination and search params when table page changes', async () => {
    render(<FileAll />);

    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(1, 10, ''));
    fireEvent.click(screen.getByText('page with search'));

    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(2, 20, 'logo'));
  });

  test('deletes file and refreshes list', async () => {
    render(<FileAll />);

    await waitFor(() => expect(screen.getByText('删除')).toBeInTheDocument());
    fireEvent.click(screen.getByText('删除'));

    await waitFor(() => expect(MosAPI.delete).toHaveBeenCalledWith(1));
    expect(MosAPI.getList).toHaveBeenCalledTimes(2);
  });

  test('saves edited file with MosAPI.Update and refreshes list', async () => {
    render(<FileAll />);

    await waitFor(() => expect(screen.getByText('save file')).toBeInTheDocument());
    fireEvent.click(screen.getByText('save file'));

    await waitFor(() => expect(MosAPI.Update).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      note: 'updated note',
    })));
    expect(MosAPI.getList).toHaveBeenCalledTimes(2);
  });
});
