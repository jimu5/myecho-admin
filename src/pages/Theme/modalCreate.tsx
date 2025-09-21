import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { ThemeApi } from '@/utils/apis/theme';

interface ModalCreateProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  okCallBack: () => void;
}

const ModalCreate: React.FC<ModalCreateProps> = ({ open, setOpen, okCallBack }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(values => {
      const themeData = {
        ...values,
        is_default: false,
        is_active: false,
        config: {}
      };
      ThemeApi.create(themeData).then(() => {
        message.success('主题创建成功');
        setOpen(false);
        form.resetFields();
        okCallBack();
      }).catch(error => {
        message.error('主题创建失败：' + error.message);
      });
    });
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  return (
    <Modal
      title="创建新主题"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          version: '1.0.0'
        }}
      >
        <Form.Item
          name="name"
          label="主题名称"
          rules={[
            { required: true, message: '请输入主题名称' },
            { pattern: /^[a-z0-9_]+$/, message: '主题名称只能包含小写字母、数字和下划线' }
          ]}
        >
          <Input placeholder="请输入主题名称（只能包含小写字母、数字和下划线）" />
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
      </Form>
    </Modal>
  );
};

export default ModalCreate;