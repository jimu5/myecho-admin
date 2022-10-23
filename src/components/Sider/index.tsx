import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafeState } from 'ahooks';

import menuConfig from './menuConfig';


const { Sider } = Layout;

const MySider: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();  // 这里的目的是为了去掉最前面的admin
  const [locationSplit, setLocationSplit] = useSafeState<string[]>([]);

  useEffect(() => {
    setLocationSplit(location.pathname.split('/').slice(2));
  }, [location, setLocationSplit])

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
      zeroWidthTriggerStyle={{
        top: '10px',
      }}
      >
      <Menu
        mode="inline"
        defaultOpenKeys={locationSplit}
        selectedKeys={[locationSplit.join('/')]}

        items={menuConfig}
        onClick={(item) => {
          navigate(item.key);
        }}
      />
    </Sider>
  );
};

export default MySider;
