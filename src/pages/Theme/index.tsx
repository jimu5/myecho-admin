import React from 'react';
import { Button, Card, Col, Image, message, Popconfirm, Progress, Row, Space, Statistic, Tag, Tooltip, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { InboxOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { EditableProTable } from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-components';
import { useRequest, useSafeState } from 'ahooks';

import { getThemeErrorMessage, ThemeApi, themeModel } from '@/utils/apis/theme';

import ModalCreate from './modalCreate';
import ModalConfig from './modalConfig';
import ModalPreview from './modalPreview';

const maxThemePackageBytes = 20 * 1024 * 1024;

const Theme: React.FC = () => {
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<themeModel[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);
  const [openModalConfig, setOpenModalConfig] = useSafeState(false);
  const [openModalPreview, setOpenModalPreview] = useSafeState(false);
  const [currentTheme, setCurrentTheme] = useSafeState<themeModel | null>(null);
  const [uploading, setUploading] = useSafeState(false);
  const [uploadProgress, setUploadProgress] = useSafeState(0);
  const [pendingAction, setPendingAction] = useSafeState('');

  const { runAsync, loading } = useRequest(
    () => ThemeApi.getAll().then((data: any) => {
      setDataSource(data);
    })
  );

  const activeTheme = dataSource?.find((theme) => theme.is_active);
  const initialLoading = loading && dataSource === undefined;
  const mutationBusy = uploading || pendingAction !== '';
  const refreshThemeList = async () => {
    try {
      await runAsync();
    } catch (error) {
      message.warning('操作已成功，但主题列表刷新失败，请手动刷新');
    }
  };

  const activateTheme = async (theme: themeModel) => {
    const actionKey = `activate:${theme.id}`;
    setPendingAction(actionKey);
    try {
      await ThemeApi.activate(theme.id);
      message.success('主题激活成功，前台已立即切换');
      await refreshThemeList();
    } catch (error) {
      message.error('主题激活失败：' + getThemeErrorMessage(error));
    } finally {
      setPendingAction('');
    }
  };

  const deleteTheme = async (theme: themeModel) => {
    const actionKey = `delete:${theme.id}`;
    setPendingAction(actionKey);
    try {
      await ThemeApi.delete(theme.id);
      message.success('删除成功');
      await refreshThemeList();
    } catch (error) {
      message.error('删除失败：' + getThemeErrorMessage(error));
    } finally {
      setPendingAction('');
    }
  };

  const uploadProps: UploadProps = {
    accept: '.zip',
    showUploadList: false,
    disabled: mutationBusy,
    multiple: false,
    customRequest: async ({ file, onError, onProgress, onSuccess }) => {
      const themeFile = file as File;
      const validationError = validateThemeFile(themeFile);
      if (validationError) {
        const error = new Error(validationError);
        message.error(validationError);
        onError?.(error);
        return;
      }
      setUploading(true);
      setUploadProgress(0);
      try {
        await ThemeApi.upload(themeFile, (percent) => {
          const nextPercent = Math.max(0, Math.min(100, percent));
          setUploadProgress(nextPercent);
          onProgress?.({ percent: nextPercent });
        });
        message.success('主题包上传成功');
        await refreshThemeList();
        onSuccess?.('ok');
      } catch (error) {
        if ((error as any)?.code === 'ECONNABORTED') {
          try {
            await runAsync();
          } catch (_) {
            // The timeout result is already uncertain; keep the single actionable warning below.
          }
          message.warning('上传请求超时，主题可能仍在安装，请刷新确认后再重试');
        } else {
          message.error('主题包上传失败：' + getThemeErrorMessage(error));
        }
        onError?.(error as Error);
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
  };

  const columns: ProColumns<themeModel>[] = [
    {
      title: '主题名称',
      dataIndex: 'name',
      width: 180,
      editable: false,
      render: (_, record) => (
        <Space direction="vertical" size={2} className="theme-page__name">
          <Space size={[4, 4]} wrap>
            <strong>{record.display_name}</strong>
            {record.is_active && <Tag color="green">启用中</Tag>}
            {record.is_default && <Tag>默认</Tag>}
            {record.is_bundled && <Tag color="cyan">内置</Tag>}
            {record.has_templates && <Tag color="blue">模板</Tag>}
            {(record.config_schema || []).length > 0 && <Tag color="purple">配置项</Tag>}
          </Space>
          <span className="theme-page__muted">{record.name}</span>
        </Space>
      ),
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
      title: '预览图',
      dataIndex: 'preview',
      width: 96,
      editable: false,
      responsive: ['md'],
      render: (_, record) => record.preview ? (
        <Image width={64} height={40} src={record.preview} style={{ objectFit: 'cover' }} />
      ) : <span className="theme-page__muted">-</span>,
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
      responsive: ['md'],
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 80,
      responsive: ['md'],
    },
    {
      title: '描述',
      dataIndex: 'description',
      responsive: ['md'],
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
      width: 180,
      render: (text, data, _, action) => (
        <Space size="small" wrap className="theme-page__actions">
          {!data.is_active && (
            <Popconfirm
              key="activate"
              title={`确定应用“${data.display_name}”主题？前台会立即切换。`}
              onConfirm={() => activateTheme(data)}
            >
              <Button
                type="link"
                size="small"
                loading={pendingAction === `activate:${data.id}`}
                disabled={mutationBusy}
              >
                应用
              </Button>
            </Popconfirm>
          )}
          {!data.is_bundled && (
            <Button
              key="config"
              type="link"
              size="small"
              disabled={mutationBusy}
              onClick={() => {
                setCurrentTheme(data);
                setOpenModalConfig(true);
              }}
            >
              配置
            </Button>
          )}
          <Button
            key="preview"
            type="link"
            size="small"
            onClick={() => {
              setCurrentTheme(data);
              setOpenModalPreview(true);
            }}
          >
            预览
          </Button>
          {!data.is_default && !data.is_bundled && (
            <Button
              key="editable"
              type="link"
              size="small"
              disabled={mutationBusy}
              onClick={() => action?.startEditable?.(data.id)}
            >
              编辑
            </Button>
          )}
          {!data.is_default && !data.is_bundled && !data.is_active && (
            <Popconfirm
              key="delete"
              title={`确定删除“${data.display_name}”主题？`}
              onConfirm={() => deleteTheme(data)}
            >
              <Button
                type="link"
                size="small"
                danger
                loading={pendingAction === `delete:${data.id}`}
                disabled={mutationBusy}
              >
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="theme-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">主题管理</h1>
          <p className="admin-page-subtitle">上传、预览、配置和切换前台主题。</p>
        </div>
      </div>
      <Row gutter={[16, 16]} className="theme-page__summary">
        <Col xs={24} md={8}>
          <Card bordered={false} loading={initialLoading}>
            <Statistic title="主题总数" value={dataSource?.length || 0} suffix="套" />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} loading={initialLoading}>
            <Statistic title="当前主题" value={activeTheme?.display_name || '-'} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bordered={false} loading={initialLoading}>
            <Statistic title="可上传格式" value="ZIP" />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} className="theme-page__upload">
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            {uploading
              ? uploadProgress >= 100
                ? '上传完成，正在校验并安装主题…'
                : `正在上传主题包 ${uploadProgress}%`
              : '拖拽主题压缩包到这里，或点击上传'}
          </p>
          {uploading && <Progress percent={uploadProgress} showInfo={false} size="small" />}
          <p className="ant-upload-hint">主题包需要包含 theme.json，可引用 style.css、script.js、预览图、templates/ 模板和 config_schema。</p>
        </Upload.Dragger>
      </Card>

      <div className="theme-page__toolbar">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} disabled={mutationBusy} onClick={() => setOpenModalCreate(true)}>
            创建轻量主题
          </Button>
          <Tooltip title="刷新">
            <Button icon={<ReloadOutlined />} loading={loading} disabled={mutationBusy || loading} onClick={() => runAsync()} />
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
            setPendingAction(`save:${data.id}`);
            const themeData = {
              display_name: data.display_name,
              author: data.author,
              version: data.version,
              description: data.description,
              preview: data.preview,
              css: data.css,
              js: data.js,
            };
            try {
              await ThemeApi.update(data.id, themeData);
              message.success('保存成功');
              await refreshThemeList();
            } catch (error) {
              message.error('保存失败：' + getThemeErrorMessage(error));
              throw error;
            } finally {
              setPendingAction('');
            }
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

function validateThemeFile(file: File) {
  if (!file.name || !file.name.toLowerCase().endsWith('.zip')) {
    return '请选择 ZIP 格式的主题包';
  }
  if (file.size > maxThemePackageBytes) {
    return '主题包不能超过 20 MB';
  }
  return '';
}
