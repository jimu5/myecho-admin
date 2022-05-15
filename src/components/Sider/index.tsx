import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

import menuConfig from './menuConfig';

const { Sider } = Layout;

const MySider: React.FC = () => {

  const navigate = useNavigate();

  return (
    <Sider
      theme='light'
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
        mode="inline"
        defaultSelectedKeys={['1']}
        items={menuConfig}
        onClick={(item) => {
          navigate(item.key);
        }}
      />
    </Sider>
  );
};

export default MySider;
