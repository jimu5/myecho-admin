import React, { useEffect } from 'react';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { useLocalStorageState, useSafeState } from 'ahooks';

import {
  loginResponse,
  passwordParams,
  profileParams,
  UserApi,
} from '@/utils/apis/user';

const Profile: React.FC = () => {
  const [profileForm] = Form.useForm<profileParams & { name: string }>();
  const [passwordForm] = Form.useForm<passwordParams & { confirm_password: string }>();
  const [, setUser] = useLocalStorageState<loginResponse | undefined>('user');
  const [profileSaving, setProfileSaving] = useSafeState(false);
  const [passwordSaving, setPasswordSaving] = useSafeState(false);

  useEffect(() => {
    UserApi.profile().then((user) => {
      setUser(user);
      profileForm.setFieldsValue(user);
    });
  }, [profileForm, setUser]);

  const saveProfile = async (values: profileParams) => {
    setProfileSaving(true);
    try {
      const user = await UserApi.updateProfile(values);
      setUser(user);
      profileForm.setFieldsValue(user);
      message.success('个人资料已更新');
    } finally {
      setProfileSaving(false);
    }
  };

  const savePassword = async ({ confirm_password: _, ...values }: passwordParams & { confirm_password: string }) => {
    setPasswordSaving(true);
    try {
      const user = await UserApi.updatePassword(values);
      setUser(user);
      passwordForm.resetFields();
      message.success('密码已更新，其他登录会话已失效');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="admin-table-page profile-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">个人资料</h1>
          <p className="admin-page-subtitle">维护公开身份和登录凭据。</p>
        </div>
      </div>
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <div className="admin-panel">
            <h2>基本信息</h2>
            <Form form={profileForm} layout="vertical" onFinish={saveProfile}>
              <Form.Item name="name" label="登录账号">
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="nick_name"
                label="显示昵称"
                rules={[{ required: true, whitespace: true, message: '请填写显示昵称' }]}
              >
                <Input maxLength={64} />
              </Form.Item>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请填写邮箱' },
                  { type: 'email', message: '请输入有效邮箱' },
                ]}
              >
                <Input maxLength={64} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={profileSaving}>保存资料</Button>
            </Form>
          </div>
        </Col>
        <Col xs={24} lg={12}>
          <div className="admin-panel">
            <h2>修改密码</h2>
            <Form form={passwordForm} layout="vertical" onFinish={savePassword}>
              <Form.Item
                name="old_password"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password autoComplete="current-password" />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 8, message: '新密码至少 8 个字符' },
                ]}
              >
                <Input.Password autoComplete="new-password" maxLength={72} />
              </Form.Item>
              <Form.Item
                name="confirm_password"
                label="确认新密码"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: '请再次输入新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      return !value || getFieldValue('new_password') === value
                        ? Promise.resolve()
                        : Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={passwordSaving}>更新密码</Button>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
