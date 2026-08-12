import React, { useCallback, useEffect } from 'react';
import { Button, Input, message, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
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
  const emptyFilters = { keyword: '', articleId: '', dateFrom: '', dateTo: '' };
  const [data, setData] = React.useState<{ total: number; list: comment[] }>({ total: 0, list: [] });
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState({ current: 1, pageSize: 10 });
  const [status, setStatus] = React.useState<number | undefined>(1);
  const [draftFilters, setDraftFilters] = React.useState(emptyFilters);
  const [filters, setFilters] = React.useState(emptyFilters);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);
  const [replying, setReplying] = React.useState<comment>();
  const [replyContent, setReplyContent] = React.useState('');
  const { current, pageSize } = page;

  const getCommentList = useCallback(() => {
    setLoading(true);
    return CommentApi.getList({
      page: current,
      page_size: pageSize,
      status,
      keyword: filters.keyword || undefined,
      article_id: Number(filters.articleId) || undefined,
      date_from: filters.dateFrom || undefined,
      date_to: filters.dateTo || undefined,
    }).then((nextData: any) => {
      setData({ total: nextData.total, list: nextData.data });
    }).finally(() => setLoading(false));
  }, [current, pageSize, status, filters]);

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
          <span className="admin-muted-text" style={{ fontSize: 12 }}>
            {record.author_name}{record.author_email ? ` · ${record.author_email}` : ''}
            {record.parent_id ? ` · 回复 #${record.parent_id}` : ''}
          </span>
        </Space>
      ),
    },
    {
      title: '文章',
      dataIndex: 'article_title',
      key: 'article_title',
      width: 220,
      responsive: ['md'],
      render: (text, record) => record.article_id ? <a href={`/admin/article/write/${record.article_id}`}>{text || '-'}</a> : '-',
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
      responsive: ['md'],
    },
    {
      title: '提交时间',
      dataIndex: 'post_time',
      key: 'post_time',
      width: 160,
      responsive: ['md'],
      render: (value: string) => value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size={[0, 4]} wrap>
          <Button type="link" size="small" onClick={() => setReplying(record)}>回复</Button>
          <Button type="link" size="small" onClick={() => updateStatus([record.id], 2)}>通过</Button>
          <Button type="link" size="small" onClick={() => updateStatus([record.id], 3)}>拒绝</Button>
          <Button type="link" size="small" onClick={() => updateStatus([record.id], 4)}>垃圾</Button>
          <Popconfirm title="确认删除?" onConfirm={() => CommentApi.delete(record.id).then(() => refresh())}>
            <Button type="link" size="small" danger>删除</Button>
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
        <Input
          allowClear
          placeholder="内容 / 作者 / 邮箱"
          style={{ width: 210 }}
          value={draftFilters.keyword}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, keyword: event.target.value }))}
        />
        <Input
          allowClear
          placeholder="文章 ID"
          type="number"
          min={1}
          step={1}
          style={{ width: 110 }}
          value={draftFilters.articleId}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, articleId: event.target.value }))}
        />
        <Input
          type="date"
          aria-label="开始日期"
          style={{ width: 145 }}
          value={draftFilters.dateFrom}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
        />
        <Input
          type="date"
          aria-label="结束日期"
          style={{ width: 145 }}
          value={draftFilters.dateTo}
          onChange={(event) => setDraftFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
        />
        <Button
          type="primary"
          onClick={() => {
            setFilters(draftFilters);
            setPage((prev) => ({ ...prev, current: 1 }));
          }}
        >
          筛选
        </Button>
        <Button
          onClick={() => {
            setDraftFilters(emptyFilters);
            setFilters(emptyFilters);
            setPage((prev) => ({ ...prev, current: 1 }));
          }}
        >
          重置
        </Button>
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
      <Modal
        title={`回复 ${replying?.author_name || '评论'}`}
        open={Boolean(replying)}
        okText="发送回复"
        okButtonProps={{ disabled: !replyContent.trim() }}
        onCancel={() => {
          setReplying(undefined);
          setReplyContent('');
        }}
        onOk={() => {
          if (!replying || !replyContent.trim()) return;
          CommentApi.reply(replying.id, replyContent.trim()).then(() => {
            message.success('回复成功');
            setReplying(undefined);
            setReplyContent('');
            refresh();
          });
        }}
      >
        <Input.TextArea
          rows={5}
          maxLength={2000}
          showCount
          value={replyContent}
          onChange={(event) => setReplyContent(event.target.value)}
          placeholder="输入管理员回复"
        />
      </Modal>
    </div>
  );
};

export default CommentPage;
