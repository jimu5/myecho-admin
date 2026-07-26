import React from 'react';
import { render, screen } from '@testing-library/react';

import Dashboard from './index';

jest.mock('@/utils/apis/article', () => ({
  canPreviewArticle: (status: number) => status === 1,
  getArticleStatusLabel: (status: number) => status === 4 ? '草稿' : '公开',
}), { virtual: true });

jest.mock('@/utils/apis/dashboard', () => ({
  DashboardApi: {
    get: jest.fn(),
  },
}), { virtual: true });

jest.mock('ahooks', () => ({
  useRequest: () => ({
    loading: false,
    data: {
      article_count: 2,
      draft_count: 1,
      pending_comment_count: 3,
      recent_articles: [
        { id: 1, title: 'Public Post', status: 1, post_time: '2026-06-01T10:00:00Z' },
        { id: 2, title: 'Draft Post', status: 4, post_time: '2026-06-02T10:00:00Z' },
      ],
      popular_articles: [
        { id: 3, title: 'Popular Post', status: 1, post_time: '2026-06-03T10:00:00Z', read_count: 99, comment_count: 5 },
      ],
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
  test('renders dashboard counts, recent articles and popular articles', () => {
    render(<Dashboard />);

    expect(screen.getByText('文章总数')).toBeInTheDocument();
    expect(screen.getAllByText('草稿')).toHaveLength(2);
    expect(screen.getByText('待审评论')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Public Post')).toBeInTheDocument();
    expect(screen.getByText('Draft Post')).toBeInTheDocument();
    expect(screen.getByText('Popular Post')).toBeInTheDocument();
    expect(screen.getByText('99 次阅读 · 5 条评论')).toBeInTheDocument();
  });
});
