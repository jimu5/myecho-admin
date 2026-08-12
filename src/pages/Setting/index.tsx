import React from "react";
import { message, Popconfirm, Space, Button, Col, Form, Input, Row, Tabs } from "antd";
import { EditableProTable } from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-components";
import { useRequest, useSafeState } from "ahooks";

import { RestorePreview, SettingApi, settingModel } from "@/utils/apis/setting";

import ModalCreate from "./modalCreate";

type BasicSetting = {
  key: string;
  label: string;
  required?: boolean;
  textarea?: boolean;
};

const BASIC_SETTINGS: BasicSetting[] = [
  { key: 'SiteTitle', label: '站点名称', required: true },
  { key: 'SiteDescription', label: '站点描述', textarea: true },
  { key: 'SiteLogo', label: 'Logo 地址' },
  { key: 'SiteFaviconIcon', label: 'Favicon 地址' },
  { key: 'SiteAuthor', label: '作者名称' },
  { key: 'SiteAuthorBio', label: '作者简介', textarea: true },
  { key: 'SiteFooter', label: '页脚内容', textarea: true },
  { key: 'SiteICP', label: '备案号' },
  { key: 'SiteSocialLinks', label: '社交链接', textarea: true },
  { key: 'SiteShareImage', label: '默认分享图地址' },
  { key: 'BaseURL', label: '站点地址', required: true },
];

const NOTIFICATION_KEY = 'CommentNotificationWebhook';
const MANAGED_KEYS = new Set<string>([...BASIC_SETTINGS.map(({ key }) => key), NOTIFICATION_KEY]);

const Setting: React.FC = () => {
  const [form] = Form.useForm<Record<string, string | boolean>>();
  const [notificationForm] = Form.useForm<{ webhook: string }>();
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<settingModel[]>([]);
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);
  const [saving, setSaving] = useSafeState(false);
  const [exporting, setExporting] = useSafeState(false);
  const [backupFile, setBackupFile] = useSafeState<File>();
  const [backupPreview, setBackupPreview] = useSafeState<RestorePreview>();
  const [restoreResult, setRestoreResult] = useSafeState<RestorePreview>();
  const [previewing, setPreviewing] = useSafeState(false);
  const [restoring, setRestoring] = useSafeState(false);

  const columns: ProColumns<settingModel>[] = [
    {
      title: '设置 key',
      dataIndex: 'key',
      width: 140,
      fieldProps: (form, {entity, }) => {
        if (entity.is_system) {
          return {
            disabled: true,
          }
        }
      }
    },
    {
      title: '描述',
      dataIndex: 'description',
      fieldProps: (form, {entity, }) => {
        if (entity.is_system) {
          return {
            disabled: true,
          }
        }
      }
    },
    {
      title: '设置 type',
      dataIndex: 'type',
      width: 100,
      readonly: true
    },
    {
      title: '设置值',
      dataIndex: 'value',
    },
    {
      title: '操作',
      key: 'actions',
      valueType: 'option',
      render: (text, data, _, action) => (
        <Space size={"middle"}>
          <Button
            key="editable"
            type="link"
            onClick={() => {
              action?.startEditable?.(data.id)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              SettingApi.delete(data.key).then(() => {
                message.success("删除成功");
                runAsync();
              })
            }}
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    },
    {
      title: '公开读取',
      dataIndex: 'is_public',
      valueType: 'switch',
      width: 100,
      fieldProps: (_form, { entity }) => ({
        disabled: entity.key === NOTIFICATION_KEY,
      }),
    }
  ]

  const { runAsync, loading } = useRequest(() => SettingApi.getAdminAll().then((data: any) => {
    const settings = data || [];
    setDataSource(settings);
    form.setFieldsValue(Object.fromEntries(settings.flatMap((item: settingModel) => [
      [item.key, item.value],
      [`${item.key}__public`, item.is_public],
    ])));
    notificationForm.setFieldsValue({
      webhook: settings.find((item: settingModel) => item.key === NOTIFICATION_KEY)?.value || '',
    });
    return settings;
  }));

  const saveBasicSettings = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await Promise.all(BASIC_SETTINGS.map(({ key, label }) => {
        const current = dataSource.find((item) => item.key === key);
        const value = String(values[key] || '');
        return current
          ? SettingApi.updateValue(key, value, current.description || label, Boolean(values[`${key}__public`]))
          : SettingApi.create({ key, value, type: 'string', description: label, is_public: Boolean(values[`${key}__public`]) });
      }));
      message.success('基础设置已保存');
      await runAsync();
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async ({ webhook }: { webhook: string }) => {
    const current = dataSource.find((item) => item.key === NOTIFICATION_KEY);
    if (current) {
      await SettingApi.updateValue(NOTIFICATION_KEY, webhook || '', current.description || '新评论通知 Webhook', false);
    } else {
      await SettingApi.create({
        key: NOTIFICATION_KEY,
        value: webhook || '',
        type: 'string',
        description: '新评论通知 Webhook',
        is_public: false,
      });
    }
    message.success('通知设置已保存');
    await runAsync();
  };

  const exportBackup = async () => {
    setExporting(true);
    try {
      const blob = await SettingApi.exportBackup();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `myecho-backup-${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('备份已开始下载');
    } finally {
      setExporting(false);
    }
  };

  const previewBackup = async () => {
    if (!backupFile) {
      message.error('请先选择 ZIP 备份文件');
      return;
    }
    setPreviewing(true);
    try {
      setBackupPreview(await SettingApi.importBackup(backupFile, true));
      setRestoreResult(undefined);
      message.success('备份校验通过');
    } finally {
      setPreviewing(false);
    }
  };

  const restoreBackup = async () => {
    if (!backupFile || !backupPreview || !window.confirm('恢复会替换当前内容和存储文件，确定继续吗？')) {
      return;
    }
    setRestoring(true);
    try {
      const result = await SettingApi.importBackup(backupFile, false);
      setRestoreResult(result);
      message.success('恢复完成');
      await runAsync();
    } finally {
      setRestoring(false);
    }
  };

  const basicSettings = (
    <div className="admin-panel">
      <Form form={form} layout="vertical" onFinish={saveBasicSettings}>
        <Row gutter={16}>
          {BASIC_SETTINGS.map(({ key, label, ...item }) => (
            <Col xs={24} md={item.textarea ? 24 : 12} key={key}>
              <Form.Item
                name={key}
                label={label}
                rules={item.required ? [{ required: true, whitespace: true, message: `请填写${label}` }] : undefined}
              >
                {item.textarea
                  ? <Input.TextArea rows={key === 'SiteAuthorBio' ? 3 : 2} placeholder={key === 'SiteSocialLinks' ? '每行一个社交链接' : undefined} />
                  : <Input placeholder={key === 'BaseURL' ? 'https://example.com' : undefined} />}
              </Form.Item>
              <label>
                <Form.Item name={`${key}__public`} valuePropName="checked" noStyle>
                  <input type="checkbox" />
                </Form.Item>
                {' '}允许公开读取
              </label>
            </Col>
          ))}
        </Row>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={saving}>保存基础设置</Button>
        </Space>
      </Form>
    </div>
  );

  const advancedSettings = (
    <>
      <div className="admin-toolbar">
        <Button onClick={() => setOpenModalCreate(true)}>创建自定义设置</Button>
      </div>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <div className="admin-table-card">
        <EditableProTable
          rowKey="id"
          columns={columns}
          value={dataSource.filter((item) => !MANAGED_KEYS.has(item.key))}
          onChange={(values) => setDataSource([
            ...dataSource.filter((item) => MANAGED_KEYS.has(item.key)),
            ...(values as settingModel[]),
          ])}
          editable={{
            type: 'single',
            editableKeys,
            onSave: async (_rowKey, data) => {
              await SettingApi.updateValue(data.key, data.value, data.description, data.is_public);
              message.success("保存成功");
              await runAsync();
            },
            onChange: setEditableKeys,
            actionRender: (_row, _config, defaultDom) => [defaultDom.save, defaultDom.cancel]
          }}
          recordCreatorProps={false}
          pagination={false}
          loading={loading}
          scroll={{ x: 'max-content' }}
        />
      </div>
    </>
  );

  const notificationSettings = (
    <div className="admin-panel">
      <Form form={notificationForm} layout="vertical" onFinish={saveNotificationSettings}>
        <Form.Item
          name="webhook"
          label="新评论通知 Webhook"
          extra="评论提交后可由服务端向此地址发送通知。该值始终私密，不会通过公开设置接口返回。"
        >
          <Input type="password" placeholder="https://example.com/webhook" autoComplete="off" />
        </Form.Item>
        <Button type="primary" htmlType="submit">保存通知设置</Button>
      </Form>
    </div>
  );

  const backupSettings = (
    <div className="admin-panel">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <p>导出包含内容与存储文件的脱敏 ZIP。恢复前必须先预检，正式恢复会自动保留当前站点的恢复点。</p>
        <Space wrap>
          <Button onClick={exportBackup} loading={exporting}>导出备份</Button>
          <input
            type="file"
            accept=".zip,application/zip"
            onChange={(event) => {
              setBackupFile(event.target.files?.[0]);
              setBackupPreview(undefined);
              setRestoreResult(undefined);
            }}
          />
          <Button onClick={previewBackup} loading={previewing} disabled={!backupFile}>预检备份</Button>
          <Button danger type="primary" onClick={restoreBackup} loading={restoring} disabled={!backupPreview}>确认恢复</Button>
        </Space>
        {backupPreview && (
          <div role="status">
            <strong>预检通过</strong>
            <p>
              备份时间：{new Date(backupPreview.exported_at).toLocaleString()}；
              文章 {backupPreview.counts.articles}，评论 {backupPreview.counts.comments}，
              设置 {backupPreview.counts.settings}，存储文件 {backupPreview.storage_files}
            </p>
          </div>
        )}
        {restoreResult && (
          <div role="status">
            <strong>恢复完成</strong>
            <p>恢复前自动备份：{restoreResult.backup_path}</p>
            {restoreResult.cleanup_warning && <p>旧存储清理提示：{restoreResult.cleanup_warning}</p>}
          </div>
        )}
      </Space>
    </div>
  );

  return (
    <div className="admin-table-page setting-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">站点设置</h1>
          <p className="admin-page-subtitle">配置公开展示信息、私密通知参数和站点备份恢复。</p>
        </div>
      </div>
      <Tabs
        defaultActiveKey="basic"
        items={[
          { key: 'basic', label: '基础设置', children: basicSettings },
          { key: 'notifications', label: '通知设置', children: notificationSettings },
          { key: 'backup', label: '备份与恢复', children: backupSettings },
          { key: 'advanced', label: '高级设置', children: advancedSettings },
        ]}
      />
    </div>
  );
}

export default Setting;
