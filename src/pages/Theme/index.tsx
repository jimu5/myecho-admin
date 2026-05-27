import React from 'react';
import { Button, Card, Col, message, Popconfirm, Row, Space, Statistic, Tag, Tooltip, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-components';
import { useRequest, useSafeState } from 'ahooks';

import { ThemeApi, themeModel } from '@/utils/apis/theme';

import ModalCreate from './modalCreate';
import ModalConfig from './modalConfig';
import ModalPreview from './modalPreview';

const Theme: React.FC = () => {
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<themeModel[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);
  const [openModalConfig, setOpenModalConfig] = useSafeState(false);
  const [openModalPreview, setOpenModalPreview] = useSafeState(false);
  const [currentTheme, setCurrentTheme] = useSafeState<themeModel | null>(null);

  const { runAsync, loading } = useRequest(
    () => ThemeApi.getAll().then((data: any) => {
      setDataSource(data);
    })
  );

  const activeTheme = dataSource?.find((theme) => theme.is_active);
  const uploadProps: UploadProps = {
    accept: '.zip',
    showUploadList: false,
    customRequest: async ({ file, onError, onSuccess }) => {
      try {
        await ThemeApi.upload(file as File);
        message.success('主题包上传成功');
        await runAsync();
        onSuccess?.('ok');
      } catch (error) {
        message.error('主题包上传失败');
        onError?.(error as Error);
      }
    },
  };

  const columns: ProColumns<themeModel>[] = [
    {
      title: '主题名称',
      dataIndex: 'name',
      width: 180,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <strong>{record.display_name}</strong>
            {record.is_active && <Tag color="green">启用中</Tag>}
            {record.is_default && <Tag>默认</Tag>}
          </Space>
          <span className="theme-page__muted">{record.name}</span>
        </Space>
      ),
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      hideInTable: true,
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 80,
    },
    {
      title: '描述',
      dataIndex: 'description',
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 100,
      render: (dom: React.ReactNode, record) => {
        return record.is_active ? <Tag color="green">已应用</Tag> : <Tag>未应用</Tag>;
      },
    },
    {
      title: '操作',
      key: 'actions',
      valueType: 'option',
      render: (text, data, _, action) => (
        <Space size={'middle'}>
          {!data.is_active && (
            <a
              key="activate"
              onClick={() => {
                ThemeApi.activate(data.id).then(() => {
                  message.success('主题激活成功');
                  runAsync();
                }).catch((err) => {
                  message.error('主题激活失败：' + err.message);
                });
              }}
            >
              应用
            </a>
          )}
          <a
            key="config"
            onClick={() => {
              setCurrentTheme(data);
              setOpenModalConfig(true);
            }}
          >
            配置
          </a>
          <a
            key="preview"
            onClick={() => {
              setCurrentTheme(data);
              setOpenModalPreview(true);
            }}
          >
            预览
          </a>
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(data.id);
            }}
            style={{ display: data.is_default ? 'none' : 'inline' }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              ThemeApi.delete(data.id).then(() => {
                message.success('删除成功');
                runAsync();
              }).catch((err) => {
                message.error('删除失败：' + err.message);
              });
            }}
            disabled={data.is_default || data.is_active}
          >
            <a style={{ display: data.is_default || data.is_active ? 'none' : 'inline' }}>
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="theme-page">
      <Row gutter={[16, 16]} className="theme-page__summary">
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="主题总数" value={dataSource?.length || 0} suffix="套" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false}>
            <Statistic title="当前主题" value={activeTheme?.display_name || '-'} />
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
          <p className="ant-upload-text">拖拽主题压缩包到这里，或点击上传</p>
          <p className="ant-upload-hint">主题包需要包含 theme.json，可引用 style.css、script.js 和预览图。</p>
        </Upload.Dragger>
      </Card>

      <div className="theme-page__toolbar">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpenModalCreate(true)}>
            创建主题
          </Button>
          <Tooltip title="刷新">
            <Button icon={<ReloadOutlined />} onClick={() => runAsync()} />
          </Tooltip>
        </Space>
      </div>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <ModalConfig 
        open={openModalConfig} 
        setOpen={setOpenModalConfig} 
        theme={currentTheme} 
        okCallBack={runAsync} 
      />
      <ModalPreview 
        open={openModalPreview} 
        setOpen={setOpenModalPreview} 
        theme={currentTheme} 
      />
      <EditableProTable
        className="theme-page__table"
        rowKey="id"
        columns={columns}
        value={dataSource || []}
        onChange={(values) => setDataSource(values as themeModel[])}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const themeData = {
              name: data.name,
              display_name: data.display_name,
              author: data.author,
              version: data.version,
              description: data.description,
              preview: data.preview,
              css: data.css,
              js: data.js,
            };
            ThemeApi.update(data.id, themeData).then(
              () => message.success('保存成功')
            ).catch((err) => {
              message.error('保存失败：' + err.message);
            });
          },
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel]
        }}
        recordCreatorProps={false}
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default Theme;
