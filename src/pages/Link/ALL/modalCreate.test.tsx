import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import ModalCreate from './modalCreate';
import { LinkAPI } from '@/utils/apis/link';

jest.mock('@/utils/apis/link', () => ({
  LinkAPI: {
    create: jest.fn(),
  },
}), { virtual: true });

jest.mock('@/utils/apis/category', () => ({
  CategoryApi: {
    getLinkList: jest.fn(),
  },
}), { virtual: true });

jest.mock('antd', () => ({
  Modal: ({ open, onOk, onCancel, children }: any) =>
    open ? (
      <div>
        <button onClick={onOk}>ok</button>
        <button onClick={onCancel}>cancel</button>
        {children}
      </div>
    ) : null,
  Space: ({ children }: any) => <div>{children}</div>,
  Input: ({ placeholder, onChange }: any) => (
    <input placeholder={placeholder} onChange={onChange} />
  ),
  TreeSelect: ({ onChange }: any) => (
    <button onClick={() => onChange('root')}>choose category</button>
  ),
  message: {
    success: jest.fn(),
  },
}));

describe('Link modalCreate', () => {
  const { CategoryApi } = jest.requireMock('@/utils/apis/category');

  beforeEach(() => {
    jest.clearAllMocks();
    (LinkAPI.create as jest.Mock).mockResolvedValue({});
    CategoryApi.getLinkList.mockResolvedValue([
      { uid: 'root', name: 'Root', father_uid: '' },
      { uid: 'child', name: 'Child', father_uid: 'root' },
    ]);
  });

  test('creates a link and refreshes parent list', async () => {
    const setOpen = jest.fn();
    const okCallBack = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={okCallBack} />);
    await waitFor(() => expect(CategoryApi.getLinkList).toHaveBeenCalled());
    fireEvent.change(screen.getByPlaceholderText('链接名'), { target: { value: 'Go' } });
    fireEvent.change(screen.getByPlaceholderText('链接描述'), { target: { value: 'Go site' } });
    fireEvent.change(screen.getByPlaceholderText('链接地址'), { target: { value: 'https://go.dev' } });
    fireEvent.change(screen.getByPlaceholderText('链接图像地址'), { target: { value: 'https://go.dev/icon.png' } });
    fireEvent.click(screen.getByText('choose category'));
    fireEvent.click(screen.getByText('ok'));

    await waitFor(() =>
      expect(LinkAPI.create).toHaveBeenCalledWith({
        name: 'Go',
        description: 'Go site',
        url: 'https://go.dev',
        icon_url: 'https://go.dev/icon.png',
        category_uid: 'root',
      })
    );
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(okCallBack).toHaveBeenCalled();
  });

  test('closes without creating on cancel', async () => {
    const setOpen = jest.fn();

    render(<ModalCreate open={true} setOpen={setOpen} okCallBack={jest.fn()} />);
    await waitFor(() => expect(CategoryApi.getLinkList).toHaveBeenCalled());
    fireEvent.click(screen.getByText('cancel'));

    expect(setOpen).toHaveBeenCalledWith(false);
    expect(LinkAPI.create).not.toHaveBeenCalled();
  });
});
