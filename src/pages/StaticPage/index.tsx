import React from 'react';
import { Button, Card, Col, message, Popconfirm, Row, Space, Statistic, Switch, Table, Tag, Tooltip, Upload } from 'antd';
import type { UploadProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';

import { StaticPageApi, staticPageModel } from '@/utils/apis/staticPage';

const StaticPage: React.FC = () => {
  const [dataSource, setDataSource] = useSafeState<staticPageModel[]>([]);
  const [updatingNavigation, setUpdatingNavigation] = useSafeState('');

  const { runAsync, loading } = useRequest(
    () => StaticPageApi.getAll().then((data: any) => {
      setDataSource(data || []);
    })
  );

  const uploadProps: UploadProps = {
    accept: '.zip',
    showUploadList: false,
    customRequest: async ({ file, onError, onSuccess }) => {
      try {
        await StaticPageApi.upload(file as File);
        message.success('静态页面上传成功');
        await runAsync();
        onSuccess?.('ok');
      } catch (error) {
        message.error('静态页面上传失败');
        onError?.(error as Error);
      }
    },
  };

  const columns: ColumnsType<staticPageModel> = [
    {
      title: '页面',
      dataIndex: 'display_name',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <strong>{record.display_name}</strong>
            <Tag color="blue">{record.entry || 'index.html'}</Tag>
          </Space>
          <span className="theme-page__muted">{record.name}</span>
        </Space>
      ),
    },
    {
      title: '访问路径',
      dataIndex: 'url',
      width: 240,
      render: (_, record) => (
        <a href={record.url} target="_blank" rel="noreferrer">
          {record.url}
        </a>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
      render: (value) => value || <span className="theme-page__muted">-</span>,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 90,
      render: (value) => value || <span className="theme-page__muted">-</span>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      render: (value) => value || <span className="theme-page__muted">-</span>,
    },
    {
      title: '主题导航',
      dataIndex: 'show_in_navigation',
      width: 110,
      render: (visible, record) => (
        <Switch
          checked={visible}
          loading={updatingNavigation === record.name}
          onChange={async (checked) => {
            setUpdatingNavigation(record.name);
            try {
              await StaticPageApi.updateNavigation(record.name, checked);
              message.success(checked ? '已加入主题导航' : '已从主题导航移除');
              try {
                await runAsync();
              } catch (error) {
                message.warning('导航设置已保存，但列表刷新失败，请手动刷新');
              }
            } catch (error) {
              message.error('导航设置更新失败');
            } finally {
              setUpdatingNavigation('');
            }
          }}
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => window.open(record.url, '_blank', 'noopener,noreferrer')}
          >
            预览
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              StaticPageApi.delete(record.name).then(() => {
                message.success('删除成功');
                runAsync();
              }).catch((err) => {
                message.error('删除失败：' + err.message);
              });
            }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="static-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">静态页面</h1>
          <p className="admin-page-subtitle">上传、预览和管理完整目录结构的静态页面。</p>
        </div>
        <Tooltip title="刷新">
          <Button
            className="static-page__refresh"
            aria-label="刷新静态页面"
            icon={<ReloadOutlined />}
            onClick={() => runAsync()}
          />
        </Tooltip>
      </div>

      <Row gutter={[16, 16]} className="theme-page__summary">
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="目录页面总数" value={dataSource.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="公开前缀" value="/static-pages" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="可上传格式" value="ZIP" />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="theme-page__upload">
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">拖拽静态页面压缩包到这里，或点击上传</p>
          <p className="ant-upload-hint">压缩包需要包含 static-page.json 和入口 HTML，页面资源可放在同一目录的子文件夹中。</p>
        </Upload.Dragger>
      </Card>

      <div className="admin-table-card static-page__table">
        <Table
          rowKey="name"
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </div>
  );
};

export default StaticPage;
