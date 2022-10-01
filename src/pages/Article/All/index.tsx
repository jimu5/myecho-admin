import React from 'react';
import { usePagination } from 'ahooks';
import { Space, Popconfirm, message, Table } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';

import { ArticleApi, article, articleStatus} from '@/utils/apis/article';
import AdminNavLink from '@/routers/AdminNavlink';


const All: React.FC = () => {
  async function getArticleList(params: {
    current: number;
    pageSize: number;
  }): Promise<{ total: number; list: article[] }> {
    return ArticleApi.getAllList({
      page: params.current,
      page_size: params.pageSize,
    }).then((data: any) => {
      return { total: data.total, list: data.data };
    });
  }

  const { data, loading, pagination, refresh } = usePagination(getArticleList);

  const columns: ColumnsType<article> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <a>{text}</a>
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (_, record) => <span>{record.category?.name}</span>
    },
    {
      title: '发布时间',
      dataIndex: 'post_time',
      width: 105,
      key: 'post_time',
      render: (text: string) => <>{dayjs(text).format('YYYY-MM-DD HH:mm:ss')}</>
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
      render: (text: number) => <span>{articleStatus.get(text)}</span>
    },
    {
      title: '点赞数',
      dataIndex: 'like_count',
      key: 'like_count',
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      render: (_, record) => (
        <Space size="middle">
          <AdminNavLink to={`article/write/${record.id}`}>编辑</AdminNavLink>
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
      fixed: "right"
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        rowKey={(data) => data.id}
        dataSource={data?.list}
        loading={loading}
        pagination={{
          total: data?.total,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: pagination.onChange,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default All;
