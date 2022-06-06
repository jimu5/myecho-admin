import React from 'react';
import { Space } from 'antd';
import type { ColumnsType } from 'antd/lib/table';

import { article, articleStatus } from '@/utils/apis/article';
import AdminNavLink from '@/routers/AdminNavlink';

const columns: ColumnsType<article> = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    render: (text) => <a>{text}</a>,
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '日期',
    dataIndex: 'post_time',
    key: 'post_time',
  },
  {
    title: '浏览',
    dataIndex: 'read_count',
    key: 'read_count',
  },
  {
    title: '评论数',
    dataIndex: 'comment_count',
    key: 'comment_count',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (text: number) => <span>{articleStatus[text]}</span>,
  },
  {
    title: '点赞数',
    dataIndex: 'like_count',
    key: 'like_count',
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <AdminNavLink to={`article/write/${record.id}`}>编辑</AdminNavLink>
        <a>删除</a>
      </Space>
    ),
  },
];

export default columns;
