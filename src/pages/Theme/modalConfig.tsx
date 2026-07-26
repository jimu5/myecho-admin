import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message, Select } from 'antd';
import { getThemeErrorMessage, ThemeApi } from '@/utils/apis/theme';
import type { ThemeConfigSchemaField, themeModel } from '@/utils/apis/theme';

interface ModalConfigProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: themeModel | null;
  okCallBack: () => void | Promise<void>;
}

const ModalConfig: React.FC<ModalConfigProps> = ({ open, setOpen, theme, okCallBack }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const schema = theme?.config_schema || [];
  const hasSchema = schema.length > 0;

  useEffect(() => {
    if (open && theme) {
      form.setFieldsValue({
        config: theme.config || {},
        editor: {
          json: JSON.stringify(theme.config || {}, null, 2),
          css: theme.css || '',
          js: theme.js || '',
        },
      });
    } else if (!open) {
      // 关闭时重置表单
      form.resetFields();
    }
  }, [open, theme, form, hasSchema]);

  const handleOk = async () => {
    if (!theme) return;

    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const schemaValues = values.config || {};
      const editor = values.editor || {};
      let payload;
      try {
        payload = JSON.parse(editor.json || '{}');
      } catch (error) {
        message.error('JSON 配置格式有误');
        return;
      }
      if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
        message.error('JSON 配置必须是对象');
        return;
      }
      if (hasSchema) Object.assign(payload, schemaValues);
      await ThemeApi.update(theme.id, {
        config: payload,
        css: editor.css || '',
        js: editor.js || '',
      });
      message.success('主题配置更新成功');
      setOpen(false);
      try {
        await okCallBack();
      } catch (error) {
        message.warning('配置已保存，但主题列表刷新失败，请手动刷新');
      }
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('主题配置更新失败：' + getThemeErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (!theme) return null;

  return (
    <Modal
      title={`${theme.display_name} 配置`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      width={600}
    >
      <Form form={form} layout="vertical">
        {hasSchema && schema.map((field) => (
          <Form.Item
            key={field.key}
            name={['config', field.key]}
            label={field.label || field.key}
            valuePropName={field.type === 'boolean' ? 'checked' : 'value'}
          >
            {renderSchemaField(field)}
          </Form.Item>
        ))}
        <Form.Item
          name={['editor', 'json']}
          label="完整配置（JSON）"
        >
          <Input.TextArea rows={10} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item
          name={['editor', 'css']}
          label="自定义 CSS"
        >
          <Input.TextArea rows={10} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
        <Form.Item
          name={['editor', 'js']}
          label="自定义 JavaScript"
        >
          <Input.TextArea rows={8} style={{ fontFamily: 'monospace' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function renderSchemaField(field: ThemeConfigSchemaField) {
  switch (field.type) {
    case 'boolean':
      return <Switch className="theme-config-switch" />;
    case 'number':
      return <InputNumber style={{ width: '100%' }} />;
    case 'textarea':
      return <Input.TextArea rows={4} />;
    case 'color':
      return <Input type="color" />;
    case 'select':
      return <Select options={(field.options || []).map((option) => {
        if (typeof option === 'string') {
          return { label: option, value: option };
        }
        return option;
      })} />;
    case 'text':
    default:
      return <Input />;
  }
}

export default ModalConfig;
