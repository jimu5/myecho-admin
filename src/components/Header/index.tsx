import React from 'react';
import { useLocalStorageState } from 'ahooks';
import { Layout, Menu, Dropdown, Space } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';

import { loginResponse } from '@/utils/apis/user';

const { Header } = Layout;
const menu = (
  <Menu
    items={[
      {
        key: '1',
        label: <a href="/profile">个人资料</a>,
      },
      {
        key: '2',
        label: <a href="/logout">退出</a>,
      }
    ]}
  />
);

const Myheader: React.FC = () => {
  const [user] = useLocalStorageState<loginResponse>('user');
  return (
    <Header style={{ background: '#fff', padding: 0 }}>
      <div style={{
        float: 'right',
        marginRight: '20px',
      }}>
        <Dropdown overlay={menu}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <span>{user?.nick_name}</span>
              <UserOutlined />
              <DownOutlined />
            </Space>
          </a>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Myheader;
