import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CommentPage from './index';
import { CommentApi } from '@/utils/apis/comment';

const commentRows = [
  {
    id: 1,
    article_id: 17,
    article_title: 'Article title',
    article_uid: 'article-uid',
    author_name: 'Alice',
    author_email: 'alice@example.com',
    author_ip: '127.0.0.1',
    author_url: '',
    author_agent: 'ua',
    content: 'hello',
    status: 1,
    like_count: 0,
    parent_id: 0,
    user_id: 0,
    post_time: '2026-05-28T09:30:00+08:00',
  },
];

jest.mock('@/utils/apis/comment', () => ({
  commentStatus: new Map([
    [1, '待审核'],
    [2, '已通过'],
    [3, '已拒绝'],
    [4, '垃圾评论'],
  ]),
  CommentApi: {
    getList: jest.fn(),
    batch: jest.fn(),
    delete: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => {
  const Select = ({ children, onChange, value }: any) => (
    <div>
      <span data-testid="status-filter">{value}</span>
      <button onClick={() => onChange(2)}>filter approved</button>
      {children}
    </div>
  );
  Select.Option = ({ children }: any) => <span>{children}</span>;

  return {
    Button: ({ children, onClick, disabled }: any) => <button disabled={disabled} onClick={onClick}>{children}</button>,
    Popconfirm: ({ children, onConfirm }: any) => <span onClick={onConfirm}>{children}</span>,
    Select,
    Space: ({ children }: any) => <div>{children}</div>,
    Table: ({ dataSource = [], columns, rowSelection, pagination }: any) => {
      const row = dataSource[0] || commentRows[0];
      const actionColumn = columns.find((column: any) => column.key === 'action');
      return (
        <div>
          <span data-testid="total">{pagination.total}</span>
          <span>{row.content}</span>
          <button onClick={() => rowSelection.onChange([row.id])}>select row</button>
          <button onClick={() => pagination.onChange(2, 20)}>next page</button>
          {actionColumn.render(null, row)}
        </div>
      );
    },
    Tag: ({ children }: any) => <span>{children}</span>,
    message: {
      success: jest.fn(),
      warning: jest.fn(),
    },
  };
});

jest.mock('dayjs', () => () => ({ format: () => '2026-05-28 09:30:00' }));

describe('CommentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (CommentApi.getList as jest.Mock).mockResolvedValue({ total: 1, data: commentRows });
    (CommentApi.batch as jest.Mock).mockResolvedValue({});
    (CommentApi.delete as jest.Mock).mockResolvedValue({});
  });

  test('loads pending comments by default', async () => {
    render(<CommentPage />);

    await waitFor(() => expect(CommentApi.getList).toHaveBeenCalledWith({
      page: 1,
      page_size: 10,
      status: 1,
    }));
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  test('batch approves selected comments', async () => {
    render(<CommentPage />);

    await waitFor(() => expect(screen.getByText('select row')).toBeInTheDocument());
    fireEvent.click(screen.getByText('select row'));
    fireEvent.click(screen.getByText('批量通过'));

    await waitFor(() => expect(CommentApi.batch).toHaveBeenCalledWith({
      ids: [1],
      action: 'status',
      status: 2,
    }));
  });
});
