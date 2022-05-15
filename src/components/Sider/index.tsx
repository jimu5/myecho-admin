import React from 'react';
import { Layout, Menu } from 'antd';

import menuConfig from './menuConfig';

const { Sider } = Layout;

const MySider: React.FC = () => {
  return (
    <Sider
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']} items={menuConfig} />
    </Sider>
  );
};

export default MySider;
