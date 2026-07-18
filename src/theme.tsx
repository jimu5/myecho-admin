import React, { useLayoutEffect, useMemo } from 'react';
import { useTheme } from 'ahooks';
import {
  ConfigProvider,
  theme as antdTheme,
  type ThemeConfig,
} from 'antd';

import { myLocale } from '@/utils/config';
import { AdminThemeContext, type AdminTheme } from '@/themeContext';

const sharedTheme: ThemeConfig = {
  token: {
    borderRadius: 8,
    borderRadiusLG: 14,
    controlHeight: 36,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  components: {
    Button: { primaryShadow: 'none' },
    Card: { headerBg: 'transparent' },
  },
};

const getTheme = (theme: AdminTheme): ThemeConfig => {
  const dark = theme === 'dark';
  return {
    ...sharedTheme,
    algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      ...sharedTheme.token,
      colorPrimary: dark ? '#3aa99c' : '#0f766e',
      colorInfo: dark ? '#3aa99c' : '#0f766e',
      colorLink: dark ? '#65c9bd' : '#0b5d55',
      colorSuccess: dark ? '#63ba8c' : '#2f7d5d',
      colorWarning: dark ? '#d9ad5e' : '#b88735',
      colorError: dark ? '#e47a67' : '#b74a35',
      colorText: dark ? '#ecf3ef' : '#17212b',
      colorTextSecondary: dark ? '#a8b6af' : '#66747f',
      colorBgLayout: dark ? '#0f1512' : '#f6f8f4',
      colorBgContainer: dark ? '#18211c' : '#fffdfa',
      colorBgElevated: dark ? '#202b25' : '#fffdfa',
      colorBorder: dark
        ? 'rgba(226, 238, 231, 0.16)'
        : 'rgba(35, 49, 61, 0.16)',
    },
    components: {
      ...sharedTheme.components,
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: dark
          ? 'rgba(58, 169, 156, 0.16)'
          : 'rgba(15, 118, 110, 0.08)',
        itemSelectedColor: dark ? '#79d5ca' : '#0b5d55',
        itemBorderRadius: 8,
      },
      Table: {
        headerBg: dark ? '#202b25' : '#f5f7f1',
        headerColor: dark ? '#a8b6af' : '#66747f',
        borderColor: dark
          ? 'rgba(226, 238, 231, 0.1)'
          : 'rgba(35, 49, 61, 0.1)',
      },
    },
  };
};

export const AdminThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme, themeMode, setThemeMode } = useTheme({
    localStorageKey: 'admin-theme-mode',
  });
  const themeConfig = useMemo(() => getTheme(theme), [theme]);

  useLayoutEffect(() => {
    document.documentElement.dataset.adminTheme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#18211c' : '#fffdfa');
    ConfigProvider.config({
      theme: themeConfig,
      holderRender: (holder) => (
        <ConfigProvider locale={myLocale} theme={themeConfig}>
          {holder}
        </ConfigProvider>
      ),
    });
    return () => ConfigProvider.config({ theme: {}, holderRender: undefined });
  }, [theme, themeConfig]);

  return (
    <AdminThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      <ConfigProvider locale={myLocale} theme={themeConfig}>
        {children}
      </ConfigProvider>
    </AdminThemeContext.Provider>
  );
};
