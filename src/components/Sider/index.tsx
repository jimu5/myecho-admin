import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

import menuConfig from './menuConfig';

const { Sider } = Layout;

const MySider: React.FC = () => {

  const navigate = useNavigate();
  const locationSplit = useLocation().pathname.split('/').slice(2);  // 这里的目的是为了去掉最前面的admin

  return (
    <Sider
      theme='light'
      breakpoint="lg"
      collapsedWidth="0"
      onBreakpoint={(broken) => {
      }}
      onCollapse={(collapsed, type) => {
      }}
      style={{
        maxWidth: '200px',
        minWidth: '150px',
        height: '100vh',
      }}
      >
      <Menu
        mode="inline"
        defaultOpenKeys={locationSplit}
        defaultSelectedKeys={[locationSplit.join('/')]}

        items={menuConfig}
        onClick={(item) => {
          navigate(item.key);
        }}
      />
    </Sider>
  );
};

export default MySider;
