import React, { useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafeState } from 'ahooks';

import menuConfig from './menuConfig';


const { Sider } = Layout;
const adminRoute = (key: string) => key.startsWith('/admin') ? key : `/admin/${key}`;

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
      className="admin-sider"
      onBreakpoint={(broken) => {
      }}
      onCollapse={(collapsed, type) => {
      }}
      style={{
        maxWidth: '220px',
        minWidth: '180px',
        height: '100vh',
      }}
      zeroWidthTriggerStyle={{
        top: '10px',
      }}
      >
      <div className="admin-brand">
        <span className="admin-brand-mark" aria-hidden="true" />
        <span>
          <span className="admin-brand-title">Myecho</span>
          <span className="admin-brand-subtitle">Blog Admin</span>
        </span>
      </div>
      <Menu
        mode="inline"
        defaultOpenKeys={locationSplit}
        selectedKeys={[locationSplit.join('/')]}

        items={menuConfig}
        onClick={(item) => {
          if (item.key === 'site') {
            window.location.href = '/';
            return;
          }
          navigate(adminRoute(String(item.key)));
        }}
      />
    </Sider>
  );
};

export default MySider;
