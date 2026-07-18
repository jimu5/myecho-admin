import { createContext, useContext } from 'react';

export type AdminThemeMode = 'light' | 'dark' | 'system';
export type AdminTheme = 'light' | 'dark';

export const AdminThemeContext = createContext<{
  theme: AdminTheme;
  themeMode: AdminThemeMode;
  setThemeMode: (mode: AdminThemeMode) => void;
}>({
  theme: 'light',
  themeMode: 'system',
  setThemeMode: () => undefined,
});

export const useAdminTheme = () => useContext(AdminThemeContext);
