import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { getThemeErrorMessage, ThemeApi } from '@/utils/apis/theme';

interface ModalCreateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  okCallBack: () => void | Promise<void>;
}

const ModalCreate: React.FC<ModalCreateProps> = ({ open, setOpen, okCallBack }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const handleOk = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const themeData = {
        ...values,
        is_default: false,
        is_active: false,
        config: {}
      };
      await ThemeApi.create(themeData);
      message.success('主题创建成功');
      setOpen(false);
      form.resetFields();
      try {
        await okCallBack();
      } catch (error) {
        message.warning('主题已创建，但列表刷新失败，请手动刷新');
      }
    } catch (error: any) {
      if (!error?.errorFields) {
        message.error('主题创建失败：' + getThemeErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <Modal
      title="创建轻量主题"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={submitting}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          version: '1.0.0',
          css: '',
          js: '',
        }}
      >
        <Form.Item
          name="name"
          label="主题名称"
          rules={[
            { required: true, message: '请输入主题名称' },
            { pattern: /^[a-z0-9_-]+$/, message: '主题名称只能包含小写字母、数字、连字符和下划线' }
          ]}
        >
          <Input placeholder="请输入主题名称（小写字母、数字、连字符或下划线）" />
        </Form.Item>
        
        <Form.Item
          name="display_name"
          label="显示名称"
          rules={[{ required: true, message: '请输入显示名称' }]}
        >
          <Input placeholder="请输入显示名称" />
        </Form.Item>
        
        <Form.Item
          name="author"
          label="作者"
          rules={[{ required: true, message: '请输入作者' }]}
        >
          <Input placeholder="请输入作者" />
        </Form.Item>
        
        <Form.Item
          name="version"
          label="版本"
          rules={[{ required: true, message: '请输入版本号' }]}
        >
          <Input placeholder="请输入版本号" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <Input.TextArea placeholder="请输入主题描述" rows={3} />
        </Form.Item>

        <Form.Item
          name="css"
          label="自定义 CSS"
          extra="适合少量样式覆盖；包含模板和资源的完整主题请上传 ZIP 包。"
        >
          <Input.TextArea placeholder="例如：:root { --link-color: #0f766e; }" rows={8} />
        </Form.Item>

        <Form.Item
          name="js"
          label="自定义 JavaScript（可选）"
        >
          <Input.TextArea placeholder="建议在 DOMContentLoaded 后执行页面交互。" rows={5} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalCreate;
