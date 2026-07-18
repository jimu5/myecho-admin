import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockNavigate = jest.fn();
const mockInsertValue = jest.fn();
const mockSetTheme = jest.fn();
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
}));

jest.mock('vditor', () => {
  function MockVditor(this: any, _id: string, options: any) {
    this.setValue = jest.fn();
    this.getValue = jest.fn(() => 'Editor content');
    this.getHTML = jest.fn(() => '<p>Editor content</p>');
    this.insertValue = mockInsertValue;
    this.setTheme = mockSetTheme;
    this.destroy = jest.fn();
    Promise.resolve().then(() => options?.after?.());
  }

  MockVditor.default = MockVditor;
  MockVditor.prototype.setValue = jest.fn();
  MockVditor.prototype.getValue = jest.fn(() => 'Editor content');
  MockVditor.prototype.getHTML = jest.fn(() => '<p>Editor content</p>');
  MockVditor.prototype.insertValue = mockInsertValue;
  MockVditor.prototype.setTheme = mockSetTheme;
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
  articleTypes: new Map([
    [1, '文章'],
    [2, '页面'],
  ]),
  articleContentFormats: new Map([
    ['markdown', 'Markdown'],
    ['html', 'HTML'],
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

jest.mock('@/utils/apis/mos', () => ({
  MosAPI: {
    getList: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/image_tool', () => ({
  isAssetTypeAnImage: jest.fn(),
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
  CodeOutlined: () => <span />,
  CommentOutlined: () => <span />,
  TagsOutlined: () => <span />,
  FolderOutlined: () => <span />,
}));

jest.mock('antd', () => {
  const Layout: any = ({ children }: any) => <div>{children}</div>;
  Layout.Content = ({ children }: any) => <main>{children}</main>;
  Layout.Sider = ({ children, breakpoint, collapsedWidth }: any) => (
    <aside
      data-testid="write-sider"
      data-breakpoint={breakpoint}
      data-collapsed-width={collapsedWidth}
    >
      {children}
    </aside>
  );

  const Select: any = ({ mode, onChange, value, children, 'aria-label': ariaLabel }: any) => (
    <div>
      <span data-testid={mode === 'multiple' ? 'tag-value' : ariaLabel === '内容类型' ? 'type-value' : ariaLabel === '内容格式' ? 'format-value' : 'status-value'}>
        {Array.isArray(value) ? value.join(',') : value}
      </span>
      <button
        type="button"
        onClick={() => onChange(mode === 'multiple' ? ['tag-react', 'tag-ts'] : ariaLabel === '内容类型' ? 2 : ariaLabel === '内容格式' ? 'html' : 3)}>
        {mode === 'multiple' ? 'select tags' : ariaLabel === '内容类型' ? 'select type' : ariaLabel === '内容格式' ? 'select format' : 'select status'}
      </button>
      {children}
    </div>
  );
  Select.Option = ({ children }: any) => <span>{children}</span>;
  const Button = ({ children, onClick, disabled }: any) => <button disabled={disabled} onClick={onClick}>{children}</button>;
  const Modal = ({ children, open }: any) => open ? <div>{children}</div> : null;
  const Input: any = ({ value, onChange }: any) => <input aria-label="media keyword" value={value} onChange={onChange} />;
  Input.TextArea = ({ id, placeholder, value, maxLength, onChange }: any) => (
    <textarea
      id={id}
      placeholder={placeholder}
      value={value}
      maxLength={maxLength}
      onChange={onChange}
    />
  );
  Input.Search = ({ value, onChange, onSearch, placeholder }: any) => (
    <div>
      <input aria-label={placeholder} value={value} onChange={onChange} />
      <button onClick={() => onSearch(value)}>search media</button>
    </div>
  );
  const List: any = ({ dataSource = [], renderItem, pagination }: any) => (
    <div>
      {dataSource.map((item: any) => <div key={item.id}>{renderItem(item)}</div>)}
      {pagination && (
        <button type="button" onClick={() => pagination.onChange(2, 10)}>next media page</button>
      )}
    </div>
  );
  List.Item = ({ children }: any) => <div>{children}</div>;

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
    Button,
    Modal,
    Input,
    List,
    Image: ({ src }: any) => <img src={src} alt="media" />,
    Space: ({ children, wrap }: any) => (
      <div data-testid="write-actions" data-wrap={wrap ? 'true' : 'false'}>{children}</div>
    ),
    notification: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

const ArticleWrite = require('./index').default;
const { ArticleApi } = require('@/utils/apis/article');
const { CategoryApi } = require('@/utils/apis/category');
const { isAssetTypeAnImage } = require('@/utils/image_tool');
const { MosAPI } = require('@/utils/apis/mos');
const { TagApi } = require('@/utils/apis/tag');
const { notification } = require('antd');

const editArticle = {
  id: 42,
  title: 'Old title',
  slug: 'old-title',
  type: 1,
  content_format: 'markdown',
  is_password_protected: true,
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
    (MosAPI.getList as jest.Mock).mockResolvedValue({
      total: 1,
      data: [{ id: 1, full_name: 'cover.png', extension_name: 'png', url: '/mos/cover.png', note: '站点封面' }],
    });
    (isAssetTypeAnImage as jest.Mock).mockImplementation((ext = '') => ['png', 'jpg', 'jpeg'].includes(String(ext).toLowerCase().replace(/^\./, '')));
    mockInsertValue.mockClear();
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
    expect(screen.getByPlaceholderText('自定义链接 slug')).toHaveValue('old-title');
    expect(screen.getByPlaceholderText('用于文章列表和分享预览，留空则自动从正文生成')).toHaveValue('Old summary');
    expect(screen.getByPlaceholderText('用于文章列表和分享预览，留空则自动从正文生成')).toHaveAttribute('maxlength', '255');
    expect(screen.getByLabelText('列表和分享摘要预览')).toHaveTextContent('Old title');
    expect(screen.getByLabelText('列表和分享摘要预览')).toHaveTextContent('Old summary');
    expect(screen.getByTestId('status-value')).toHaveTextContent('2');
    expect(screen.getByTestId('type-value')).toHaveTextContent('1');
    expect(screen.getByTestId('format-value')).toHaveTextContent('markdown');
    expect(screen.getByTestId('tag-value')).toHaveTextContent('tag-old');
    expect(screen.getByTestId('write-actions')).toHaveAttribute('data-wrap', 'true');
    expect(screen.getByTestId('write-sider')).not.toHaveAttribute('data-breakpoint');
    expect(screen.getByTestId('write-sider')).not.toHaveAttribute('data-collapsed-width');
    expect(mockSetTheme).toHaveBeenCalledWith('classic', 'light');
  });

  test('patches edited article with updated title, status, time, comments, tags and category', async () => {
    mockParams = { id: '42' };

    await renderArticleWrite();

    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'Updated title' } });
    fireEvent.change(screen.getByPlaceholderText('自定义链接 slug'), { target: { value: 'updated-title' } });
    fireEvent.change(screen.getByPlaceholderText('用于文章列表和分享预览，留空则自动从正文生成'), { target: { value: 'Updated summary' } });
    fireEvent.change(screen.getByPlaceholderText('访问密码'), { target: { value: 'new secret' } });
    fireEvent.click(screen.getByText('select status'));
    fireEvent.click(screen.getByText('select type'));
    fireEvent.click(screen.getByText('select format'));
    fireEvent.click(screen.getByText('set post time'));
    fireEvent.click(screen.getByText('comments off'));
    fireEvent.click(screen.getByText('select tags'));
    fireEvent.click(screen.getByText('select category'));
    fireEvent.click(screen.getByText('立即发布'));

    await waitFor(() => expect(ArticleApi.patch).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        title: 'Updated title',
        slug: 'updated-title',
        summary: 'Updated summary',
        type: 2,
        content_format: 'html',
        password: 'new secret',
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
    fireEvent.change(screen.getByPlaceholderText('自定义链接 slug'), { target: { value: 'new-article' } });
    fireEvent.change(screen.getByPlaceholderText('用于文章列表和分享预览，留空则自动从正文生成'), { target: { value: 'New summary' } });
    fireEvent.click(screen.getByText('select status'));
    fireEvent.click(screen.getByText('select type'));
    fireEvent.click(screen.getByText('select format'));
    fireEvent.click(screen.getByText('set post time'));
    fireEvent.click(screen.getByText('comments off'));
    fireEvent.click(screen.getByText('select tags'));
    fireEvent.click(screen.getByText('select category'));
    fireEvent.click(screen.getByText('立即发布'));

    await waitFor(() => expect(ArticleApi.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New article',
      slug: 'new-article',
      summary: 'New summary',
      type: 2,
      content_format: 'html',
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

  test('clears an existing article password when requested', async () => {
    mockParams = { id: '42' };

    await renderArticleWrite();

    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    fireEvent.click(screen.getByText('清除密码'));
    fireEvent.click(screen.getByText('立即发布'));

    await waitFor(() => expect(ArticleApi.patch).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        clear_password: true,
      })
    ));
  });

  test('saves a new article as draft with status override', async () => {
    await renderArticleWrite();

    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'Draft article' } });
    fireEvent.click(screen.getByText('保存草稿'));

    await waitFor(() => expect(ArticleApi.create).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Draft article',
      status: 4,
    })));
  });

  test('prevents duplicate article submissions while saving', async () => {
    let resolveCreate: (value: unknown) => void = () => undefined;
    (ArticleApi.create as jest.Mock).mockImplementationOnce(() => new Promise((resolve) => {
      resolveCreate = resolve;
    }));
    await renderArticleWrite();

    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'Single submit' } });
    const publish = screen.getByRole('button', { name: '立即发布' });
    fireEvent.click(publish);
    fireEvent.click(publish);

    expect(ArticleApi.create).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole('button', { name: '保存中...' })).toHaveLength(2);
    screen.getAllByRole('button', { name: '保存中...' }).forEach((button) => {
      expect(button).toBeDisabled();
    });

    await act(async () => resolveCreate({}));
    expect(mockNavigate).toHaveBeenCalledWith('/admin/article/all');
  });

  test('previews html articles in an iframe without script permissions', async () => {
    await renderArticleWrite();

    fireEvent.click(screen.getByText('select format'));
    fireEvent.click(screen.getByText('预览'));

    const preview = screen.getByTitle('文章预览内容');
    expect(preview).toHaveAttribute('sandbox', '');
    expect(preview.getAttribute('srcdoc')).toContain('<body>Editor content</body>');
    expect(preview.getAttribute('srcdoc')).not.toContain('allow-scripts');
  });

  test('blocks saving after an edit article load failure and retries successfully', async () => {
    mockParams = { id: '42' };
    (ArticleApi.get_no_read as jest.Mock)
      .mockRejectedValueOnce(new Error('详情加载失败'))
      .mockResolvedValueOnce(editArticle);

    await renderArticleWrite();

    expect(await screen.findByRole('alert')).toHaveTextContent('文章加载失败：详情加载失败');
    const publish = screen.getByRole('button', { name: '立即发布' });
    expect(publish).toBeDisabled();
    fireEvent.click(publish);
    expect(ArticleApi.patch).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '重试' }));

    await waitFor(() => expect(ArticleApi.get_no_read).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByPlaceholderText('添加标题')).toHaveValue('Old title'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '立即发布' })).toBeEnabled();
  });

  test('marks metadata edits as unsaved changes', async () => {
    await renderArticleWrite();

    fireEvent.change(screen.getByPlaceholderText('添加标题'), { target: { value: 'Unsaved title' } });

    expect(screen.getByText(/有未发布改动/)).toBeInTheDocument();
    expect(screen.getByText(/最近编辑/)).toBeInTheDocument();
    expect(screen.queryByText(/已自动保存/)).not.toBeInTheDocument();
  });

  test('inserts selected media into editor', async () => {
    await renderArticleWrite();

    fireEvent.click(screen.getByText('媒体库'));
    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(1, 20, ''));
    await waitFor(() => expect(screen.getByText('cover.png')).toBeInTheDocument());
    fireEvent.click(screen.getByText('cover.png'));

    expect(mockInsertValue).toHaveBeenCalledWith('![站点封面](/mos/cover.png)');
  });

  test('loads media by keyword and pagination before inserting', async () => {
    await renderArticleWrite();

    fireEvent.click(screen.getByText('媒体库'));
    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(1, 20, ''));
    fireEvent.change(screen.getByLabelText('搜索文件名'), { target: { value: 'cover' } });
    fireEvent.click(screen.getByText('search media'));
    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(1, 20, 'cover'));
    fireEvent.click(screen.getByText('next media page'));

    await waitFor(() => expect(MosAPI.getList).toHaveBeenCalledWith(2, 10, 'cover'));
  });
});
