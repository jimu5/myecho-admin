import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, message } from 'antd';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

interface ModalConfigProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: themeModel | null;
  okCallBack: () => void;
}

const ModalConfig: React.FC<ModalConfigProps> = ({ open, setOpen, theme, okCallBack }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && theme) {
      // 设置表单初始值为主题的配置
      form.setFieldsValue(theme.config || {});
    } else if (!open) {
      // 关闭时重置表单
      form.resetFields();
    }
  }, [open, theme, form]);

  const handleOk = () => {
    if (!theme) return;
    
    form.validateFields().then(values => {
      ThemeApi.updateConfig(theme.id, values).then(() => {
        message.success('主题配置更新成功');
        setOpen(false);
        okCallBack();
      }).catch(error => {
        message.error('主题配置更新失败：' + error.message);
      });
    });
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
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={theme.config || {}}
      >
        {/* 这里可以根据主题类型动态生成配置项 */}
        {/* 以下是一些通用的配置项示例 */}
        <Form.Item
          name="primaryColor"
          label="主色调"
          rules={[{ required: false }]}
        >
          <Input placeholder="例如：#1890ff" />
        </Form.Item>
        
        <Form.Item
          name="showHeader"
          label="显示头部"
          valuePropName="checked"
          rules={[{ required: false }]}
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="showFooter"
          label="显示底部"
          valuePropName="checked"
          rules={[{ required: false }]}
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="sidebarWidth"
          label="侧边栏宽度"
          rules={[{ required: false }]}
        >
          <InputNumber min={100} max={400} />
        </Form.Item>
        
        <Form.Item
          name="customCSS"
          label="自定义CSS"
          rules={[{ required: false }]}
        >
          <Input.TextArea rows={4} placeholder="输入自定义CSS样式" />
        </Form.Item>
        
        <Form.Item
          name="customJS"
          label="自定义JavaScript"
          rules={[{ required: false }]}
        >
          <Input.TextArea rows={4} placeholder="输入自定义JavaScript代码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalConfig;