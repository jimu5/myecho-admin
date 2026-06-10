import React, { useCallback, useEffect } from 'react';
import { Button, DatePicker, Input, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';

import { ArticleApi, article, articleListParams, articleStatus, canPreviewArticle } from '@/utils/apis/article';
import { CategoryApi, category } from '@/utils/apis/category';
import { TagApi, tag as tagModel } from '@/utils/apis/tag';
import AdminNavLink from '@/routers/AdminNavlink';

const { RangePicker } = DatePicker;
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
      render: (text, record) => <a href={`/articles/${record.id}`} target="_blank" rel="noreferrer">{text}</a>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => <span>{record.category?.name || '-'}</span>,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
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
      render: (text: string) => <>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</>,
    },
    {
      title: '浏览',
      dataIndex: 'read_count',
      key: 'read_count',
      width: 80,
    },
    {
      title: '评论',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text: number) => <Tag color={text === 1 || text === 2 ? 'green' : text === 4 ? 'default' : 'orange'}>{articleStatus.get(text)}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="middle">
          <AdminNavLink to={`article/write/${record.id}`}>编辑</AdminNavLink>
          {canPreviewArticle(record.status) ? (
            <a href={`/articles/${record.id}`} target="_blank" rel="noreferrer">预览</a>
          ) : (
            <span style={{ color: '#86909c' }}>未发布</span>
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
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right',
    },
  ];

  return (
    <div>
      <Space key={filterResetKey} wrap style={{ marginBottom: 16 }}>
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
        <RangePicker
          onChange={(_, dateStrings) => applyFilters({
            ...filters,
            date_from: dateStrings[0] || undefined,
            date_to: dateStrings[1] || undefined,
          })}
        />
        <Button onClick={resetFilters}>重置</Button>
      </Space>
      <Space wrap style={{ marginBottom: 16 }}>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => batchUpdateStatus(1)}>批量公开</Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => batchUpdateStatus(4)}>批量草稿</Button>
        <Popconfirm title="确认批量删除?" onConfirm={batchDelete}>
          <Button danger disabled={selectedRowKeys.length === 0}>批量删除</Button>
        </Popconfirm>
      </Space>
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
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default All;
