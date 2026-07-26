import React from 'react';
import { Card, Col, List, Row, Statistic, Tag } from 'antd';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';

import { article, canPreviewArticle, getArticleStatusLabel } from '@/utils/apis/article';
import { DashboardApi } from '@/utils/apis/dashboard';
import AdminNavLink from '@/routers/AdminNavlink';

const Dashboard: React.FC = () => {
  const { data, loading } = useRequest(DashboardApi.get);
  const recentArticles = (data?.recent_articles || []) as article[];
  const popularArticles = (data?.popular_articles || []) as article[];

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
            <Statistic title="文章总数" value={data?.article_count || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-stat-card dashboard-stat-card--drafts" loading={loading}>
            <Statistic title="草稿" value={data?.draft_count || 0} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="dashboard-stat-card dashboard-stat-card--comments" loading={loading}>
            <Statistic title="待审评论" value={data?.pending_comment_count || 0} />
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
                    title={canPreviewArticle(item.status, item.post_time) ? (
                      <a href={`/articles/${item.id}`} target="_blank" rel="noreferrer">{item.title}</a>
                    ) : item.title}
                    description={<span>{dayjs(item.post_time).format('YYYY-MM-DD HH:mm')} · <Tag>{getArticleStatusLabel(item.status, item.post_time)}</Tag></span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            className="dashboard-feed-card"
            title="热门文章"
            extra={<AdminNavLink to="article/all">查看全部</AdminNavLink>}
            loading={loading}>
            <List
              dataSource={popularArticles}
              locale={{
                emptyText: (
                  <div className="admin-empty">
                    <strong>暂无热门文章</strong>
                    <span>文章产生阅读后会显示在这里。</span>
                  </div>
                ),
              }}
              renderItem={(item) => (
                <List.Item actions={[<AdminNavLink to={`article/write/${item.id}`}>编辑</AdminNavLink>]}>
                  <List.Item.Meta
                    title={canPreviewArticle(item.status, item.post_time) ? (
                      <a href={`/articles/${item.id}`} target="_blank" rel="noreferrer">{item.title}</a>
                    ) : item.title}
                    description={`${item.read_count || 0} 次阅读 · ${item.comment_count || 0} 条评论`}
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
