import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();
let mockParams: { id?: string } = {};

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

jest.mock('ahooks', () => ({
  useSafeState: jest.requireActual('react').useState,
  useLocalStorageState: (_key: string, options: any) => jest.requireActual('react').useState({
    title: '',
    tags: [],
    category_uid: null,
    is_allow_comment: false,
    post_time: undefined,
    ...options.defaultValue,
  }),
  useRequest: (request: any) => {
    const React = jest.requireActual('react');
    const requestRef = React.useRef(request);
    const loadedRef = React.useRef(false);
    requestRef.current = request;
    React.useEffect(() => {
      if (!loadedRef.current) {
        loadedRef.current = true;
        requestRef.current();
      }
    }, []);
    return {
      loading: false,
      runAsync: React.useCallback(() => requestRef.current(), []),
    };
  },
}));

jest.mock('vditor', () => {
  function MockVditor(this: any, _id: string, options: any) {
    this.setValue = jest.fn();
    this.getValue = jest.fn(() => 'Editor content');
    this.destroy = jest.fn();
    Promise.resolve().then(() => options?.after?.());
  }

  MockVditor.default = MockVditor;
  MockVditor.prototype.setValue = jest.fn();
  MockVditor.prototype.getValue = jest.fn(() => 'Editor content');
  MockVditor.prototype.destroy = jest.fn();

  return MockVditor;
});

jest.mock('@/utils/apis/article', () => ({
  articleStatus: new Map([
    [1, '公开'],
    [2, '置顶'],
    [3, '私密'],
    [4, '草稿'],
  ]),
  ArticleApi: {
    get_no_read: jest.fn(),
    patch: jest.fn(),
    create: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/apis/tag', () => ({
  TagApi: {
    getList: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/apis/category', () => ({
  CategoryApi: {
    getArticleList: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/vditorConfg', () => ({
  vditorUploadOptions: {},
}), { virtual: true });

jest.mock('@/utils/config', () => ({
  myLocale: { DatePicker: {} },
}), { virtual: true });

jest.mock('@ant-design/icons', () => ({
  KeyOutlined: () => <span />,
  ClockCircleOutlined: () => <span />,
  CommentOutlined: () => <span />,
  TagsOutlined: () => <span />,
  FolderOutlined: () => <span />,
}));

jest.mock('antd', () => {
  const Layout = ({ children }: any) => <div>{children}</div>;
  Layout.Content = ({ children }: any) => <main>{children}</main>;
  Layout.Sider = ({ children }: any) => <aside>{children}</aside>;

  const Select = ({ mode, onChange, value, children }: any) => (
    <div>
      <span data-testid={mode === 'multiple' ? 'tag-value' : 'status-value'}>
        {Array.isArray(value) ? value.join(',') : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(mode === 'multiple' ? ['tag-react', 'tag-ts'] : 3)}>
        {mode === 'multiple' ? 'select tags' : 'select status'}
      </button>
      {children}
    </div>
  );
  Select.Option = ({ children }: any) => <span>{children}</span>;

  return {
    Layout,
    Card: ({ children, title }: any) => (
      <section>
        {title}
        {children}
      </section>
    ),
    Select,
    DatePicker: ({ onChange }: any) => (
      <button
        type="button"
        onClick={() => onChange(null, '2026-05-28T09:30:00+08:00')}>
        set post time
      </button>
    ),
    Switch: ({ checked, onChange }: any) => (
      <button type="button" onClick={() => onChange(!checked)}>
        {checked ? 'comments on' : 'comments off'}
      </button>
    ),
    TreeSelect: ({ value, onChange }: any) => (
      <button type="button" data-value={value || ''} onClick={() => onChange('cat-child')}>
        select category
      </button>
    ),
    notification: {
      success: jest.fn(),
    },
  };
});

const ArticleWrite = require('./index').default;
const { ArticleApi } = require('@/utils/apis/article');
const { CategoryApi } = require('@/utils/apis/category');
const { TagApi } = require('@/utils/apis/tag');
const { notification } = require('antd');

const editArticle = {
  id: 42,
  title: 'Old title',
  summary: 'Old summary',
  detail: { id: 7, content: 'Loaded markdown' },
  category_uid: 'cat-root',
  is_allow_comment: false,
  post_time: '2026-01-01T00:00:00+08:00',
  status: 2,
  visibility: 1,
  tags: [{ uid: 'tag-old', name: 'old' }],
};

const renderArticleWrite = async () => {
  await act(async () => {
    render(<ArticleWrite />);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('ArticleWrite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = {};
    (ArticleApi.get_no_read as jest.Mock).mockResolvedValue(editArticle);
    (ArticleApi.patch as jest.Mock).mockResolvedValue({});
    (ArticleApi.create as jest.Mock).mockResolvedValue({});
    (TagApi.getList as jest.Mock).mockResolvedValue([
      { uid: 'tag-react', name: 'React' },
      { uid: 'tag-ts', name: 'TypeScript' },
    ]);
    (CategoryApi.getArticleList as jest.Mock).mockResolvedValue([
      { uid: 'cat-root', name: 'Root', father_uid: '' },
      { uid: 'cat-child', name: 'Child', father_uid: 'cat-root' },
    ]);
    localStorage.clear();
    document.body.innerHTML = '';
  });

  test('loads edit article data into the form', async () => {
    mockParams = { id: '42' };

    await renderArticleWrite();

    await waitFor(() => expect(ArticleApi.get_no_read).toHaveBeenCalledWith(42));
    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    expect(screen.getByTestId('status-value')).toHaveTextContent('2');
    expect(screen.getByTestId('tag-value')).toHaveTextContent('tag-old');
  });

  test('patches edited article with updated title, status, time, comments, tags and category', async () => {
    mockParams = { id: '42' };

    await renderArticleWrite();

    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'Updated title' } });
    fireEvent.click(screen.getByText('select status'));
    fireEvent.click(screen.getByText('set post time'));
    fireEvent.click(screen.getByText('comments off'));
    fireEvent.click(screen.getByText('select tags'));
    fireEvent.click(screen.getByText('select category'));
    fireEvent.click(screen.getByText('立即发布'));

    await waitFor(() => expect(ArticleApi.patch).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        title: 'Updated title',
        status: 3,
        post_time: '2026-05-28T09:30:00+08:00',
        is_allow_comment: true,
        category_uid: 'cat-child',
        tag_uids: ['tag-react', 'tag-ts'],
      })
    ));
    expect(notification.success).toHaveBeenCalledWith({ message: '更新成功' });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/article/all');
  });

  test('creates a new article from draft page state when publishing', async () => {
    await renderArticleWrite();

    await waitFor(() => expect(TagApi.getList).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'New article' } });
    fireEvent.click(screen.getByText('select status'));
    fireEvent.click(screen.getByText('set post time'));
    fireEvent.click(screen.getByText('comments off'));
    fireEvent.click(screen.getByText('select tags'));
    fireEvent.click(screen.getByText('select category'));
    fireEvent.click(screen.getByText('立即发布'));

    await waitFor(() => expect(ArticleApi.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New article',
      status: 3,
      post_time: '2026-05-28T09:30:00+08:00',
      is_allow_comment: true,
      category_uid: 'cat-child',
      tag_uids: ['tag-react', 'tag-ts'],
      visibility: 1,
    })));
    expect(notification.success).toHaveBeenCalledWith({ message: '保存成功' });
    expect(mockNavigate).toHaveBeenCalledWith('/admin/article/all');
  });

  test('saves an existing article as draft with status override', async () => {
    mockParams = { id: '42' };

    await renderArticleWrite();

    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    fireEvent.click(screen.getByText('保存草稿'));

    await waitFor(() => expect(ArticleApi.patch).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        status: 4,
        tag_uids: ['tag-old'],
      })
    ));
  });
});
