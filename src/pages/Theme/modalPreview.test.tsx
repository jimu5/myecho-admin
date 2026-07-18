import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalPreview from './modalPreview';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

jest.mock('@/utils/apis/theme', () => ({
  getThemeErrorMessage: (error: any) => error?.msg || error?.message || '未知错误',
  ThemeApi: {
    previewToken: jest.fn(),
    clearPreview: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => {
  const Input: any = (props: any) => <input {...props} />;
  Input.Search = ({ value, onChange, onSearch }: any) => (
    <div>
      <input aria-label="预览页面路径" value={value} onChange={onChange} />
      <button type="button" onClick={() => onSearch(value)}>加载页面</button>
    </div>
  );
  return {
    Modal: ({ title, open, onCancel, children }: any) =>
      open ? (
        <div>
          <h1>{title}</h1>
          <button onClick={onCancel}>cancel preview</button>
          {children}
        </div>
      ) : null,
    Spin: ({ children, spinning }: any) => <div data-testid="preview-spinner" data-spinning={String(spinning)}>{children}</div>,
    Segmented: ({ options, value, onChange }: any) => (
      <div aria-label="预览设备尺寸">
        {options.map((option: any) => (
          <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    ),
    Input,
    message: {
      error: jest.fn(),
    },
  };
});

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
    expect(screen.getByTestId('preview-spinner')).toHaveAttribute('data-spinning', 'true');
    fireEvent.load(iframe);
    expect(screen.getByTestId('preview-spinner')).toHaveAttribute('data-spinning', 'false');

    fireEvent.click(screen.getByText('cancel preview'));
    expect(ThemeApi.clearPreview).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('renders nothing without theme', () => {
    const { container } = render(<ModalPreview open={true} setOpen={jest.fn()} theme={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('loads a different site path and clears preview on unmount', async () => {
    const { unmount } = render(<ModalPreview open={true} setOpen={jest.fn()} theme={theme} />);
    await waitFor(() => expect(ThemeApi.previewToken).toHaveBeenCalledWith(1, '/'));

    fireEvent.change(screen.getByLabelText('预览页面路径'), { target: { value: '/archive' } });
    fireEvent.click(screen.getByText('加载页面'));
    await waitFor(() => expect(ThemeApi.previewToken).toHaveBeenCalledWith(1, '/archive'));

    unmount();
    expect(ThemeApi.clearPreview).toHaveBeenCalled();
  });

  test('switches the preview viewport without reloading the page', async () => {
    const { container } = render(<ModalPreview open={true} setOpen={jest.fn()} theme={theme} />);
    await screen.findByTitle('Clean Theme 预览');

    fireEvent.click(screen.getByText('手机'));
    expect(container.querySelector('.theme-preview-viewport')).toHaveStyle({ maxWidth: '390px' });
    expect(ThemeApi.previewToken).toHaveBeenCalledTimes(1);
  });
});
