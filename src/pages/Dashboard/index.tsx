import React from 'react';
import { Card, Col, List, Row, Statistic, Tag } from 'antd';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';

import { ArticleApi, article, articleStatus, canPreviewArticle } from '@/utils/apis/article';
import { CommentApi, comment } from '@/utils/apis/comment';
import AdminNavLink from '@/routers/AdminNavlink';

const Dashboard: React.FC = () => {
  const { data, loading } = useRequest(async () => {
    const [articles, drafts, pendingComments] = await Promise.all([
      ArticleApi.getAllList({ page: 1, page_size: 5 }),
      ArticleApi.getAllList({ page: 1, page_size: 1, status: 4 }),
      CommentApi.getList({ page: 1, page_size: 5, status: 1 }),
    ]);
    return {
      articles: articles as any,
      drafts: drafts as any,
      pendingComments: pendingComments as any,
    };
  });

  const recentArticles = (data?.articles?.data || []) as article[];
  const recentComments = (data?.pendingComments?.data || []) as comment[];

  return (
    <div className="admin-page dashboard-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">仪表盘</h1>
          <p className="admin-page-subtitle">快速查看文章、草稿和待审评论的最新状态。</p>
        </div>
        <AdminNavLink to="article/write">写新文章</AdminNavLink>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="dashboard-stat-card dashboard-stat-card--articles" loading={loading}>
            <Statistic title="文章总数" value={data?.articles?.total || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-stat-card dashboard-stat-card--drafts" loading={loading}>
            <Statistic title="草稿" value={data?.drafts?.total || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-stat-card dashboard-stat-card--comments" loading={loading}>
            <Statistic title="待审评论" value={data?.pendingComments?.total || 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} className="dashboard-feed-grid">
        <Col xs={24} lg={12}>
          <Card
            className="dashboard-feed-card"
            title="最近文章"
            extra={<AdminNavLink to="article/all">查看全部</AdminNavLink>}
            loading={loading}>
            <List
              dataSource={recentArticles}
              locale={{
                emptyText: (
                  <div className="admin-empty">
                    <strong>暂无文章</strong>
                    <span>发布第一篇文章后会显示在这里。</span>
                  </div>
                ),
              }}
              renderItem={(item) => (
                <List.Item actions={[<AdminNavLink to={`article/write/${item.id}`}>编辑</AdminNavLink>]}>
                  <List.Item.Meta
                    title={canPreviewArticle(item.status) ? (
                      <a href={`/articles/${item.id}`} target="_blank" rel="noreferrer">{item.title}</a>
                    ) : item.title}
                    description={<span>{dayjs(item.post_time).format('YYYY-MM-DD HH:mm')} · <Tag>{articleStatus.get(item.status)}</Tag></span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="dashboard-feed-card"
            title="待审评论"
            extra={<AdminNavLink to="comments">进入审核</AdminNavLink>}
            loading={loading}>
            <List
              dataSource={recentComments}
              locale={{
                emptyText: (
                  <div className="admin-empty">
                    <strong>暂无待审评论</strong>
                    <span>新的评论提交后会进入审核队列。</span>
                  </div>
                ),
              }}
              renderItem={(item) => (
                <List.Item actions={[<AdminNavLink to="comments">审核</AdminNavLink>]}>
                  <List.Item.Meta
                    title={`${item.author_name} 评论了 ${item.article_title || '文章'}`}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
