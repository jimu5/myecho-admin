import React from 'react';
import { Layout, Menu } from 'antd';

import menuConfig from './menuConfig';

const { Sider } = Layout;

const MySider: React.FC = () => {
  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
        console.log(broken);
      }}
      onCollapse={(collapsed, type) => {
        console.log(collapsed, type);
      }}
      style={{
        maxWidth: '200px',
        minWidth: '150px',
        height: '100vh',
      }}
      >
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={menuConfig}
      />
    </Sider>
  );
};

export default MySider;
