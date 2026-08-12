import React from 'react';
import { useLocalStorageState } from 'ahooks';
import { Layout, Menu, Dropdown, Space } from 'antd';
import {
  DesktopOutlined,
  DownOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { type AdminThemeMode, useAdminTheme } from '@/themeContext';
import { loginResponse, UserApi } from '@/utils/apis/user';

const { Header } = Layout;
const themeModeLabels: Record<AdminThemeMode, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
};

const Myheader: React.FC = () => {
  const navigate = useNavigate();
  const [user] = useLocalStorageState<loginResponse>('user');
  const [loggingOut, setLoggingOut] = React.useState(false);
  const { theme, themeMode, setThemeMode } = useAdminTheme();
  const displayName = user?.nick_name || '管理员';
  const ThemeIcon = themeMode === 'system'
    ? DesktopOutlined
    : theme === 'dark' ? MoonOutlined : SunOutlined;
  const themeMenu = {
    items: [
      { key: 'light', icon: <SunOutlined />, label: '浅色' },
      { key: 'dark', icon: <MoonOutlined />, label: '深色' },
      { key: 'system', icon: <DesktopOutlined />, label: '跟随系统' },
    ],
    selectable: true,
    selectedKeys: [themeMode],
    onClick: ({ key }: { key: string }) => setThemeMode(key as AdminThemeMode),
  };
  const logout = async () => {
    if (loggingOut) {
      return;
    }
    setLoggingOut(true);
    try {
      if (user?.token) {
        await UserApi.logout(user.token);
      }
      localStorage.removeItem('user');
      navigate('/admin/login', { replace: true });
    } catch {
      return;
    } finally {
      setLoggingOut(false);
    }
  };
  const menu = (
    <Menu
      items={[
        {
          key: '1',
          label: <span onClick={() => navigate('/admin/profile')}>个人资料</span>,
        },
        {
          key: '2',
          label: (
            <span
              onClick={() => void logout()}>
              {loggingOut ? '退出中...' : '退出'}
            </span>
          ),
        }
      ]}
    />
  );
  return (
    <Header className="admin-header">
      <div className="admin-header-title">
        <strong>内容工作台</strong>
        <span>写作、发布、评论和站点资产管理</span>
      </div>
      <div className="admin-header-actions">
        <Dropdown menu={themeMenu} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            className="admin-theme-menu"
            aria-label={`当前外观：${themeModeLabels[themeMode]}，切换外观`}
          >
            <ThemeIcon aria-hidden="true" />
            <span className="admin-theme-label">{themeModeLabels[themeMode]}</span>
          </button>
        </Dropdown>
        <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
          <button
            type="button"
            className="admin-user-menu"
            aria-label={`${displayName}，打开用户菜单`}
          >
            <Space>
              <span className="admin-user-name">{displayName}</span>
              <UserOutlined />
              <DownOutlined />
            </Space>
          </button>
        </Dropdown>
      </div>
    </Header>
  );
};

export default Myheader;
