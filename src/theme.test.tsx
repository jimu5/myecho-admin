import React from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { AdminThemeProvider } from './theme';
import { useAdminTheme } from './themeContext';

jest.mock('@/utils/config', () => ({ myLocale: {} }));

const Probe = () => {
  const { theme, themeMode, setThemeMode } = useAdminTheme();
  return (
    <>
      <output>{`${themeMode}:${theme}`}</output>
      <button type="button" onClick={() => setThemeMode('dark')}>暗色</button>
      <button type="button" onClick={() => setThemeMode('system')}>跟随系统</button>
    </>
  );
};

describe('AdminThemeProvider', () => {
  test('persists the selected mode and follows system preference', () => {
    const globalConfigSpy = jest.spyOn(ConfigProvider, 'config');
    let onSystemChange: ((event: { matches: boolean }) => void) | undefined;
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn(() => ({
        matches: false,
        addEventListener: (_event: string, listener: typeof onSystemChange) => {
          onSystemChange = listener;
        },
        removeEventListener: jest.fn(),
      })),
    });
    localStorage.clear();

    render(<AdminThemeProvider><Probe /></AdminThemeProvider>);

    expect(screen.getByText('system:light')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-admin-theme', 'light');
    expect(globalConfigSpy).toHaveBeenCalledWith(expect.objectContaining({
      holderRender: expect.any(Function),
      theme: expect.any(Object),
    }));

    fireEvent.click(screen.getByRole('button', { name: '暗色' }));
    expect(screen.getByText('dark:dark')).toBeInTheDocument();
    expect(localStorage.getItem('admin-theme-mode')).toBe('dark');
    expect(globalConfigSpy).toHaveBeenLastCalledWith(expect.objectContaining({
      theme: expect.objectContaining({ algorithm: antdTheme.darkAlgorithm }),
    }));

    fireEvent.click(screen.getByRole('button', { name: '跟随系统' }));
    act(() => onSystemChange?.({ matches: true }));

    expect(screen.getByText('system:dark')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-admin-theme', 'dark');
  });
});
