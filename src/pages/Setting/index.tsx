import React from "react";
import { message, Popconfirm, Space, Button, Col, Form, Input, Row, Tabs } from "antd";
import { EditableProTable } from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-components";
import { useRequest, useSafeState } from "ahooks";

import { SettingApi, settingModel } from "@/utils/apis/setting";

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

const BASIC_KEYS = new Set<string>(BASIC_SETTINGS.map(({ key }) => key));

const Setting: React.FC = () => {
  const [form] = Form.useForm<Record<string, string>>();
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<settingModel[]>([]);
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);
  const [saving, setSaving] = useSafeState(false);
  const [exporting, setExporting] = useSafeState(false);

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
    }
  ]

  const { runAsync, loading } = useRequest(() => SettingApi.getAll().then((data: any) => {
    const settings = data || [];
    setDataSource(settings);
    form.setFieldsValue(Object.fromEntries(settings.map((item: settingModel) => [item.key, item.value])));
    return settings;
  }));

  const saveBasicSettings = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await Promise.all(BASIC_SETTINGS.map(({ key, label }) => {
        const current = dataSource.find((item) => item.key === key);
        const value = values[key] || '';
        return current
          ? SettingApi.updateValue(key, value, current.description || label)
          : SettingApi.create({ key, value, type: 'string', description: label });
      }));
      message.success('基础设置已保存');
      await runAsync();
    } finally {
      setSaving(false);
    }
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
            </Col>
          ))}
        </Row>
        <Space wrap>
          <Button type="primary" htmlType="submit" loading={saving}>保存基础设置</Button>
          <Button onClick={exportBackup} loading={exporting}>导出备份</Button>
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
          value={dataSource.filter((item) => !BASIC_KEYS.has(item.key))}
          onChange={(values) => setDataSource([
            ...dataSource.filter((item) => BASIC_KEYS.has(item.key)),
            ...(values as settingModel[]),
          ])}
          editable={{
            type: 'single',
            editableKeys,
            onSave: async (_rowKey, data) => {
              await SettingApi.updateValue(data.key, data.value, data.description);
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

  return (
    <div className="admin-table-page setting-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">站点设置</h1>
          <p className="admin-page-subtitle">配置站点展示信息，导出内容备份，并管理高级参数。</p>
        </div>
      </div>
      <Tabs
        defaultActiveKey="basic"
        items={[
          { key: 'basic', label: '基础设置', children: basicSettings },
          { key: 'advanced', label: '高级设置', children: advancedSettings },
        ]}
      />
    </div>
  );
}

export default Setting;
