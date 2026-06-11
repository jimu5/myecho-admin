import React from 'react';
import { render, screen } from '@testing-library/react';

import Dashboard from './index';

jest.mock('@/utils/apis/article', () => ({
  ArticleApi: {
    getAllList: jest.fn(),
  },
  articleStatus: new Map([
    [1, '已发布'],
    [4, '草稿'],
  ]),
  canPreviewArticle: (status: number) => status === 1,
}), { virtual: true });

jest.mock('@/utils/apis/comment', () => ({
  CommentApi: {
    getList: jest.fn(),
  },
}), { virtual: true });

jest.mock('ahooks', () => ({
  useRequest: () => ({
    loading: false,
    data: {
      articles: {
        total: 2,
        data: [
          { id: 1, title: 'Public Post', status: 1, post_time: '2026-06-01T10:00:00Z' },
          { id: 2, title: 'Draft Post', status: 4, post_time: '2026-06-02T10:00:00Z' },
        ],
      },
      drafts: { total: 1, data: [] },
      pendingComments: {
        total: 1,
        data: [{ id: 9, author_name: 'Alice', article_title: 'Public Post', content: 'Nice article' }],
      },
    },
  }),
}));

jest.mock('antd', () => {
  const React = require('react');
  const List: any = ({ dataSource, renderItem }: any) => (
    <ul>
      {dataSource.map((item: any, index: number) => (
        <React.Fragment key={item.id || index}>{renderItem(item)}</React.Fragment>
      ))}
    </ul>
  );
  List.Item = ({ children, actions = [] }: any) => (
    <li>
      {children}
      {actions.map((action: any, index: number) => (
        <span key={index}>{action}</span>
      ))}
    </li>
  );
  List.Item.Meta = ({ title, description }: any) => (
    <div>
      <div>{title}</div>
      <p>{description}</p>
    </div>
  );

  return {
    Card: ({ children, title }: any) => (
      <section>
        {title && <h2>{title}</h2>}
        {children}
      </section>
    ),
    Col: ({ children }: any) => <div>{children}</div>,
    List,
    Row: ({ children }: any) => <div>{children}</div>,
    Statistic: ({ title, value }: any) => (
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    ),
    Tag: ({ children }: any) => <span>{children}</span>,
  };
});

jest.mock('@/routers/AdminNavlink', () => ({ children, to }: any) => (
  <a href={`/admin/${to}`}>{children}</a>
), { virtual: true });

describe('Dashboard', () => {
  test('renders article and comment summary cards', () => {
    render(<Dashboard />);

    expect(screen.getByText('文章总数')).toBeInTheDocument();
    expect(screen.getAllByText('草稿')).toHaveLength(2);
    expect(screen.getAllByText('待审评论')).toHaveLength(2);
    expect(screen.getByText('Public Post')).toBeInTheDocument();
    expect(screen.getByText('Draft Post')).toBeInTheDocument();
    expect(screen.getByText('Alice 评论了 Public Post')).toBeInTheDocument();
    expect(screen.getByText('Nice article')).toBeInTheDocument();
  });
});
