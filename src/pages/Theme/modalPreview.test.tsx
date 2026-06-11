import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalPreview from './modalPreview';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

jest.mock('@/utils/apis/theme', () => ({
  ThemeApi: {
    previewToken: jest.fn(),
    clearPreview: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => ({
  Modal: ({ title, open, onCancel, children }: any) =>
    open ? (
      <div>
        <h1>{title}</h1>
        <button onClick={onCancel}>cancel preview</button>
        {children}
      </div>
    ) : null,
  Spin: ({ children }: any) => <div>{children}</div>,
  message: {
    error: jest.fn(),
  },
}));

const theme = {
  id: 1,
  name: 'clean',
  display_name: 'Clean Theme',
  author: 'Myecho',
  version: '1.0.0',
  css: 'body { color: red; }',
  js: 'window.preview = true;',
  config: {},
} as themeModel;

describe('ModalPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (ThemeApi.previewToken as jest.Mock).mockResolvedValue({ preview_url: '/theme-preview?token=abc&path=%2F' });
    (ThemeApi.clearPreview as jest.Mock).mockResolvedValue({});
  });

  test('renders real preview iframe and closes modal', async () => {
    const setOpen = jest.fn();

    render(<ModalPreview open={true} setOpen={setOpen} theme={theme} />);

    expect(screen.getByText('Clean Theme 预览')).toBeInTheDocument();
    await waitFor(() => expect(ThemeApi.previewToken).toHaveBeenCalledWith(1, '/'));
    const iframe = await screen.findByTitle('Clean Theme 预览');
    expect(iframe).toHaveAttribute('src', '/theme-preview?token=abc&path=%2F');

    fireEvent.click(screen.getByText('cancel preview'));
    expect(ThemeApi.clearPreview).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('renders nothing without theme', () => {
    const { container } = render(<ModalPreview open={true} setOpen={jest.fn()} theme={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
