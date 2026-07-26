import React, { useCallback, useEffect } from 'react';
import { Button, DatePicker, Input, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';

import { ArticleApi, article, articleListParams, articleStatus, articleTypes, canPreviewArticle, getArticleStatusLabel, isScheduledArticle } from '@/utils/apis/article';
import { CategoryApi, category } from '@/utils/apis/category';
import { TagApi, tag as tagModel } from '@/utils/apis/tag';
import AdminNavLink from '@/routers/AdminNavlink';

const { Option } = Select;

type ArticleTableState = {
  total: number;
  list: article[];
};

const All: React.FC = () => {
  const [data, setData] = React.useState<ArticleTableState>({ total: 0, list: [] });
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState({ current: 1, pageSize: 10 });
  const [filters, setFilters] = React.useState<Omit<articleListParams, 'page' | 'page_size'>>({});
  const [filterResetKey, setFilterResetKey] = React.useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [categoryData, setCategoryData] = React.useState<category[]>([]);
  const [tagData, setTagData] = React.useState<tagModel[]>([]);
  const { current, pageSize } = page;

  const articlePreviewPath = (record: article) => {
    if (record.slug) {
      return record.type === 2 ? `/pages/${record.slug}` : `/posts/${record.slug}`;
    }
    return `/articles/${record.id}`;
  };

  const getArticleList = useCallback(() => {
    setLoading(true);
    return ArticleApi.getAllList({
      page: current,
      page_size: pageSize,
      ...filters,
    }).then((nextData: any) => {
      setData({ total: nextData.total, list: nextData.data });
    }).finally(() => setLoading(false));
  }, [current, filters, pageSize]);

  useEffect(() => {
    getArticleList();
  }, [getArticleList]);

  useEffect(() => {
    CategoryApi.getArticleList().then(setCategoryData);
    TagApi.getList().then(setTagData);
  }, []);

  const refresh = () => {
    setSelectedRowKeys([]);
    return getArticleList();
  };

  const applyFilters = (nextFilters: Omit<articleListParams, 'page' | 'page_size'>) => {
    setSelectedRowKeys([]);
    setFilters(nextFilters);
    setPage((prev) => ({ ...prev, current: 1 }));
  };

  const resetFilters = () => {
    setFilterResetKey((prev) => prev + 1);
    applyFilters({});
  };

  const batchUpdateStatus = (status: number) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择文章');
      return;
    }
    ArticleApi.batch({
      ids: selectedRowKeys.map(Number),
      action: 'status',
      status,
    }).then(() => {
      message.success('批量更新成功');
      refresh();
    });
  };

  const batchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择文章');
      return;
    }
    ArticleApi.batch({
      ids: selectedRowKeys.map(Number),
      action: 'delete',
    }).then(() => {
      message.success('批量删除成功');
      refresh();
    });
  };

  const columns: ColumnsType<article> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 260,
      render: (text, record) => <a href={articlePreviewPath(record)} target="_blank" rel="noreferrer">{text}</a>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      responsive: ['md'],
      render: (value: number) => <Tag>{articleTypes.get(value) || '文章'}</Tag>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      responsive: ['md'],
      render: (_, record) => <span>{record.category?.name || '-'}</span>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      responsive: ['md'],
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          {record.tags?.map((item) => <Tag key={item.uid}>{item.name}</Tag>)}
        </Space>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'post_time',
      width: 160,
      key: 'post_time',
      responsive: ['md'],
      render: (text: string) => <>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</>,
    },
    {
      title: '浏览',
      dataIndex: 'read_count',
      key: 'read_count',
      width: 80,
      responsive: ['md'],
    },
    {
      title: '评论',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 80,
      responsive: ['md'],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: number, record) => (
        <Tag color={isScheduledArticle(record) ? 'blue' : status === 1 || status === 2 ? 'green' : status === 4 ? 'default' : 'orange'}>
          {getArticleStatusLabel(status, record.post_time)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <AdminNavLink to={`article/write/${record.id}`}>编辑</AdminNavLink>
          {canPreviewArticle(record.status, record.post_time) ? (
            <a className="admin-table-action" href={articlePreviewPath(record)} target="_blank" rel="noreferrer">预览</a>
          ) : (
            <span className="admin-muted-text">未发布</span>
          )}
          <Popconfirm
            title="确认删除?"
            onConfirm={() => {
              ArticleApi.delete(record.id).then(() => {
                message.success('删除成功');
                refresh();
              });
            }}
            okText="确认"
            cancelText="取消">
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right',
    },
  ];

  return (
    <div className="admin-table-page article-all-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">所有文章</h1>
          <p className="admin-page-subtitle">筛选、批量调整状态，并快速进入编辑或预览。</p>
        </div>
        <AdminNavLink to="article/write">写新文章</AdminNavLink>
      </div>
      <Space key={filterResetKey} wrap className="admin-filterbar">
        <Input.Search
          allowClear
          placeholder="搜索标题或摘要"
          style={{ width: 220 }}
          onSearch={(keyword) => applyFilters({ ...filters, keyword: keyword || undefined })}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          onChange={(status) => applyFilters({ ...filters, status })}
        >
          {Array.from(articleStatus).map(([value, label]) => (
            <Option value={value} key={value}>{label}</Option>
          ))}
        </Select>
        <Select
          allowClear
          placeholder="类型"
          style={{ width: 120 }}
          onChange={(type) => applyFilters({ ...filters, type })}
        >
          {Array.from(articleTypes).map(([value, label]) => (
            <Option value={value} key={value}>{label}</Option>
          ))}
        </Select>
        <Select
          allowClear
          showSearch
          placeholder="分类"
          optionFilterProp="children"
          style={{ width: 160 }}
          onChange={(category_uid) => applyFilters({ ...filters, category_uid })}
        >
          {categoryData.map((item) => (
            <Option value={item.uid} key={item.uid}>{item.name}</Option>
          ))}
        </Select>
        <Select
          allowClear
          showSearch
          placeholder="标签"
          optionFilterProp="children"
          style={{ width: 160 }}
          onChange={(tag_uid) => applyFilters({ ...filters, tag_uid })}
        >
          {tagData.map((item) => (
            <Option value={item.uid} key={item.uid}>{item.name}</Option>
          ))}
        </Select>
        <DatePicker
          aria-label="开始日期"
          placeholder="开始日期"
          format="YYYY-MM-DD"
          value={filters.date_from ? dayjs(filters.date_from) : null}
          maxDate={filters.date_to ? dayjs(filters.date_to) : undefined}
          onChange={(_, dateString) => applyFilters({
            ...filters,
            date_from: typeof dateString === 'string' && dateString ? dateString : undefined,
          })}
        />
        <DatePicker
          aria-label="结束日期"
          placeholder="结束日期"
          format="YYYY-MM-DD"
          value={filters.date_to ? dayjs(filters.date_to) : null}
          minDate={filters.date_from ? dayjs(filters.date_from) : undefined}
          onChange={(_, dateString) => applyFilters({
            ...filters,
            date_to: typeof dateString === 'string' && dateString ? dateString : undefined,
          })}
        />
        <Button onClick={resetFilters}>重置</Button>
      </Space>
      <Space wrap className="admin-actionbar">
        <Button disabled={selectedRowKeys.length === 0} onClick={() => batchUpdateStatus(1)}>批量公开</Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => batchUpdateStatus(4)}>批量草稿</Button>
        <Popconfirm title="确认批量删除?" onConfirm={batchDelete}>
          <Button danger disabled={selectedRowKeys.length === 0}>批量删除</Button>
        </Popconfirm>
      </Space>
      <div className="admin-table-card">
      <Table
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data.list}
        loading={loading}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{
          total: data.total,
          pageSize: page.pageSize,
          current: page.current,
          onChange: (current, pageSize) => setPage({ current, pageSize }),
        }}
        locale={{
          emptyText: (
            <div className="admin-empty">
              <strong>没有找到文章</strong>
              <span>调整筛选条件，或先写一篇新文章。</span>
            </div>
          ),
        }}
        scroll={{ x: 'max-content' }}
      />
      </div>
    </div>
  );
};

export default All;
