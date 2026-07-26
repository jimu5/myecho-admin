import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import All from './index';
import { ArticleApi } from '@/utils/apis/article';
import { CategoryApi } from '@/utils/apis/category';
import { TagApi } from '@/utils/apis/tag';

const articleRows = [
  {
    id: 1,
    title: 'Hello',
    category: { id: 1, name: 'Tech' },
    category_uid: 'cat-tech',
    tags: [{ uid: 'tag-go', name: 'Go' }],
    post_time: '2026-05-28T09:30:00+08:00',
    read_count: 3,
    comment_count: 1,
    like_count: 0,
    status: 1,
    slug: 'hello',
    type: 1,
  },
];

jest.mock('@/routers/AdminNavlink', () => ({ children }: any) => <a>{children}</a>, { virtual: true });

jest.mock('@/utils/apis/article', () => ({
  articleStatus: new Map([
    [1, '公开'],
    [2, '置顶'],
    [3, '私密'],
    [4, '草稿'],
  ]),
  articleTypes: new Map([
    [1, '文章'],
    [2, '页面'],
  ]),
  canPreviewArticle: jest.fn((status?: number) => status === 1 || status === 2),
  getArticleStatusLabel: jest.fn((status?: number) => new Map([
    [1, '公开'],
    [2, '置顶'],
    [3, '私密'],
    [4, '草稿'],
  ]).get(status ?? 0)),
  isScheduledArticle: jest.fn(() => false),
  ArticleApi: {
    getAllList: jest.fn(),
    batch: jest.fn(),
    delete: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/apis/category', () => ({
  CategoryApi: {
    getArticleList: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/apis/tag', () => ({
  TagApi: {
    getList: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => {
  const Select: any = ({ children, onChange, placeholder }: any) => (
    <div>
      <button onClick={() => onChange(placeholder === '状态' ? 4 : placeholder === '分类' ? 'cat-tech' : placeholder === '类型' ? 2 : 'tag-go')}>
        select {placeholder}
      </button>
      {children}
    </div>
  );
  Select.Option = ({ children }: any) => <span>{children}</span>;
  const DatePicker: any = () => null;
  DatePicker.RangePicker = ({ onChange }: any) => (
    <button onClick={() => onChange(null, ['2026-05-01', '2026-05-31'])}>select date</button>
  );
  const Input: any = () => null;
  Input.Search = ({ onSearch }: any) => <button onClick={() => onSearch('hello')}>search keyword</button>;

  return {
    Button: ({ children, onClick, disabled }: any) => <button disabled={disabled} onClick={onClick}>{children}</button>,
    DatePicker,
    Input,
    Popconfirm: ({ children, onConfirm }: any) => <span onClick={onConfirm}>{children}</span>,
    Select,
    Space: ({ children }: any) => <div>{children}</div>,
    Table: ({ dataSource = [], columns, rowSelection, pagination }: any) => {
      const row = dataSource[0] || articleRows[0];
      const actionColumn = columns.find((column: any) => column.key === 'action');
      const statusColumn = columns.find((column: any) => column.key === 'status');
      return (
        <div>
          <span data-testid="total">{pagination.total}</span>
          <span>{row.title}</span>
          <button onClick={() => rowSelection.onChange([row.id])}>select article</button>
          <button onClick={() => pagination.onChange(2, 20)}>next page</button>
          {statusColumn.render(row.status, row)}
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

describe('Article All', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ArticleApi.getAllList as jest.Mock).mockResolvedValue({ total: 1, data: articleRows });
    (ArticleApi.batch as jest.Mock).mockResolvedValue({});
    (ArticleApi.delete as jest.Mock).mockResolvedValue({});
    (CategoryApi.getArticleList as jest.Mock).mockResolvedValue([{ uid: 'cat-tech', name: 'Tech' }]);
    (TagApi.getList as jest.Mock).mockResolvedValue([{ uid: 'tag-go', name: 'Go' }]);
  });

  test('loads article list and applies keyword filter', async () => {
    render(<All />);

    await waitFor(() => expect(ArticleApi.getAllList).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      page_size: 10,
    })));
    fireEvent.click(screen.getByText('search keyword'));

    await waitFor(() => expect(ArticleApi.getAllList).toHaveBeenLastCalledWith(expect.objectContaining({
      keyword: 'hello',
      page: 1,
      page_size: 10,
    })));
  });

  test('batch updates selected articles to draft', async () => {
    render(<All />);

    await waitFor(() => expect(screen.getByText('select article')).toBeInTheDocument());
    fireEvent.click(screen.getByText('select article'));
    fireEvent.click(screen.getByText('批量草稿'));

    await waitFor(() => expect(ArticleApi.batch).toHaveBeenCalledWith({
      ids: [1],
      action: 'status',
      status: 4,
    }));
  });

  test('clears selected rows when applying a filter', async () => {
    render(<All />);

    await waitFor(() => expect(screen.getByText('select article')).toBeInTheDocument());
    fireEvent.click(screen.getByText('select article'));
    expect(screen.getByText('批量草稿')).not.toBeDisabled();

    fireEvent.click(screen.getByText('search keyword'));

    await waitFor(() => expect(screen.getByText('批量草稿')).toBeDisabled());
  });

  test('filters articles by content type', async () => {
    render(<All />);

    await waitFor(() => expect(screen.getByText('select 类型')).toBeInTheDocument());
    fireEvent.click(screen.getByText('select 类型'));

    await waitFor(() => expect(ArticleApi.getAllList).toHaveBeenLastCalledWith(expect.objectContaining({
      type: 2,
      page: 1,
      page_size: 10,
    })));
  });

  test('offers every article status as a filter option', async () => {
    render(<All />);

    expect(await screen.findByText('置顶')).toBeInTheDocument();
    expect(screen.getByText('私密')).toBeInTheDocument();
    expect(screen.getByText('草稿')).toBeInTheDocument();
  });
});
