import React, { useCallback, useEffect, useRef } from 'react';
import { Layout, Menu } from 'antd';
import { CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSafeState } from 'ahooks';

import { useAdminTheme } from '@/themeContext';
import menuConfig from './menuConfig';


const { Sider } = Layout;
const adminRoute = (key: string) => key.startsWith('/admin') ? key : `/admin/${key}`;
const selectedMenuKey = (pathname: string) => {
  const path = pathname.replace(/^\/admin\/?/, '').replace(/\/$/, '');
  if (!path) return '/admin';
  if (path.startsWith('article/write/')) return 'article/write';
  return path;
};

const MySider: React.FC = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useAdminTheme();
  const selectedKey = selectedMenuKey(location.pathname);
  const parentKey = selectedKey !== '/admin' && selectedKey.includes('/')
    ? selectedKey.split('/')[0]
    : '';
  const [openKeys, setOpenKeys] = useSafeState<string[]>(parentKey ? [parentKey] : []);
  const [collapsed, setCollapsed] = useSafeState(false);
  const [isMobile, setIsMobile] = useSafeState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMobileNav = useCallback(() => {
    setCollapsed(true);
    toggleRef.current?.focus();
  }, [setCollapsed]);

  useEffect(() => {
    setOpenKeys(parentKey ? [parentKey] : []);
  }, [parentKey, setOpenKeys]);

  useEffect(() => {
    if (!isMobile || collapsed) return;
    const previousOverflow = document.body.style.overflow;
    const navigation = document.getElementById('admin-navigation');
    const visibleMenuItems = () => Array.from(
      navigation?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [],
    ).filter((item) => item.getClientRects().length > 0);
    const focusTimer = window.requestAnimationFrame(() => visibleMenuItems()[0]?.focus());
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileNav();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = [...visibleMenuItems(), toggleRef.current].filter(Boolean) as HTMLElement[];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMobileNav, collapsed, isMobile]);

  return (
    <>
      {isMobile && !collapsed && (
        <div
          className="admin-sider-mask"
          aria-hidden="true"
          onClick={closeMobileNav}
        />
      )}
      <Sider
        theme={theme}
        breakpoint="lg"
        collapsedWidth="0"
        width={224}
        className="admin-sider"
        collapsed={collapsed}
        role={isMobile && !collapsed ? 'dialog' : undefined}
        aria-modal={isMobile && !collapsed ? true : undefined}
        aria-label={isMobile && !collapsed ? '后台导航' : undefined}
        trigger={null}
        onBreakpoint={(broken) => {
          setIsMobile(broken);
          setCollapsed(broken);
        }}
        onCollapse={(nextCollapsed) => {
          if (isMobile && nextCollapsed) {
            closeMobileNav();
            return;
          }
          setCollapsed(nextCollapsed);
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
          id="admin-navigation"
          aria-label="后台导航"
          mode="inline"
          openKeys={openKeys}
          selectedKeys={[selectedKey]}
          items={menuConfig}
          onOpenChange={(keys) => setOpenKeys(keys)}
          onClick={(item) => {
            if (isMobile) closeMobileNav();
            if (item.key === 'site') {
              window.location.href = '/';
              return;
            }
            navigate(adminRoute(String(item.key)));
          }}
        />
        <button
          ref={toggleRef}
          type="button"
          className="admin-sider-toggle"
          aria-controls="admin-navigation"
          aria-expanded={isMobile && !collapsed}
          aria-label={isMobile && !collapsed ? '关闭后台导航' : '打开后台导航'}
          onClick={() => {
            if (isMobile && !collapsed) {
              closeMobileNav();
              return;
            }
            setCollapsed(false);
          }}
        >
          {isMobile && !collapsed ? <CloseOutlined /> : <MenuOutlined />}
        </button>
      </Sider>
    </>
  );
};

export default MySider;
