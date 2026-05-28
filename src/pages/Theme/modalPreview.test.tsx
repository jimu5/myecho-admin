import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import ModalPreview from './modalPreview';
import type { themeModel } from '@/utils/apis/theme';

jest.mock('antd', () => ({
  Modal: ({ title, open, onCancel, children }: any) =>
    open ? (
      <div>
        <h1>{title}</h1>
        <button onClick={onCancel}>cancel preview</button>
        {children}
      </div>
    ) : null,
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
  test('renders generated preview iframe and closes modal', () => {
    const setOpen = jest.fn();

    render(<ModalPreview open={true} setOpen={setOpen} theme={theme} />);

    expect(screen.getByText('Clean Theme 预览')).toBeInTheDocument();
    const iframe = screen.getByTitle('Clean Theme 预览');
    expect(iframe).toHaveAttribute('srcDoc', expect.stringContaining('body { color: red; }'));
    expect(iframe).toHaveAttribute('srcDoc', expect.stringContaining('window.preview = true;'));

    fireEvent.click(screen.getByText('cancel preview'));
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  test('renders nothing without theme', () => {
    const { container } = render(<ModalPreview open={true} setOpen={jest.fn()} theme={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});
