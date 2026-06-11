import React, { useCallback, useEffect } from 'react';
import { Button, message, Popconfirm, Select, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/lib/table';
import dayjs from 'dayjs';

import { CommentApi, comment, commentStatus } from '@/utils/apis/comment';

const { Option } = Select;

const statusColor = (status: number) => {
  if (status === 1) return 'orange';
  if (status === 2) return 'green';
  if (status === 3) return 'red';
  return 'default';
};

const CommentPage: React.FC = () => {
  const [data, setData] = React.useState<{ total: number; list: comment[] }>({ total: 0, list: [] });
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState({ current: 1, pageSize: 10 });
  const [status, setStatus] = React.useState<number | undefined>(1);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const { current, pageSize } = page;

  const getCommentList = useCallback(() => {
    setLoading(true);
    return CommentApi.getList({
      page: current,
      page_size: pageSize,
      status,
    }).then((nextData: any) => {
      setData({ total: nextData.total, list: nextData.data });
    }).finally(() => setLoading(false));
  }, [current, pageSize, status]);

  useEffect(() => {
    getCommentList();
  }, [getCommentList]);

  const refresh = () => {
    setSelectedRowKeys([]);
    return getCommentList();
  };

  const updateStatus = (ids: number[], nextStatus: number) => {
    if (ids.length === 0) {
      message.warning('请选择评论');
      return;
    }
    CommentApi.batch({ ids, action: 'status', status: nextStatus }).then(() => {
      message.success('更新成功');
      refresh();
    });
  };

  const deleteComments = (ids: number[]) => {
    if (ids.length === 0) {
      message.warning('请选择评论');
      return;
    }
    CommentApi.batch({ ids, action: 'delete' }).then(() => {
      message.success('删除成功');
      refresh();
    });
  };

  const columns: ColumnsType<comment> = [
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      width: 320,
      render: (text, record) => (
        <Space direction="vertical" size={2}>
          <span>{text}</span>
          <span style={{ color: '#86909c', fontSize: 12 }}>
            {record.author_name} · {record.author_email}
          </span>
        </Space>
      ),
    },
    {
      title: '文章',
      dataIndex: 'article_title',
      key: 'article_title',
      width: 220,
      render: (text, record) => record.article_id ? <a href={`/articles/${record.article_id}`} target="_blank" rel="noreferrer">{text || '-'}</a> : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (value: number) => <Tag color={statusColor(value)}>{commentStatus.get(value)}</Tag>,
    },
    {
      title: 'IP',
      dataIndex: 'author_ip',
      key: 'author_ip',
      width: 130,
    },
    {
      title: '提交时间',
      dataIndex: 'post_time',
      key: 'post_time',
      width: 160,
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space>
          <a onClick={() => updateStatus([record.id], 2)}>通过</a>
          <a onClick={() => updateStatus([record.id], 3)}>拒绝</a>
          <a onClick={() => updateStatus([record.id], 4)}>垃圾</a>
          <Popconfirm title="确认删除?" onConfirm={() => CommentApi.delete(record.id).then(() => refresh())}>
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-table-page comment-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">评论审核</h1>
          <p className="admin-page-subtitle">集中处理待审核、拒绝和垃圾评论。</p>
        </div>
      </div>
      <Space wrap className="admin-filterbar">
        <Select
          allowClear
          placeholder="评论状态"
          style={{ width: 160 }}
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage((prev) => ({ ...prev, current: 1 }));
          }}
        >
          {Array.from(commentStatus).map(([value, label]) => (
            <Option value={value} key={value}>{label}</Option>
          ))}
        </Select>
        <Button onClick={() => refresh()}>刷新</Button>
      </Space>
      <Space wrap className="admin-actionbar">
        <Button disabled={selectedRowKeys.length === 0} onClick={() => updateStatus(selectedRowKeys.map(Number), 2)}>批量通过</Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => updateStatus(selectedRowKeys.map(Number), 3)}>批量拒绝</Button>
        <Button disabled={selectedRowKeys.length === 0} onClick={() => updateStatus(selectedRowKeys.map(Number), 4)}>标记垃圾</Button>
        <Popconfirm title="确认批量删除?" onConfirm={() => deleteComments(selectedRowKeys.map(Number))}>
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
              <strong>暂无评论</strong>
              <span>当前筛选状态下没有需要处理的评论。</span>
            </div>
          ),
        }}
        scroll={{ x: 'max-content' }}
      />
      </div>
    </div>
  );
};

export default CommentPage;
