import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import TagIndex from './index';
import { TagApi } from '@/utils/apis/tag';

const mockRun = jest.fn();

jest.mock('@/utils/apis/tag', () => ({
  TagApi: {
    getList: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
}), { virtual: true });

jest.mock('ahooks', () => ({
  useSafeState: jest.requireActual('react').useState,
  useRequest: () => ({
    data: [{ id: 1, name: 'go', uid: 'tag-go' }],
    loading: false,
    run: mockRun,
  }),
}));

jest.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span>plus</span>,
  CloseOutlined: () => <button>close tag</button>,
}));

jest.mock('antd', () => ({
  Tag: ({ children, onClick, closeIcon }: any) => (
    <span onClick={onClick}>
      {children}
      {closeIcon}
    </span>
  ),
  Input: ({ value, onChange, onPressEnter, ...props }: any) => (
    <input
      aria-label="tag-input"
      value={value}
      onChange={onChange}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          onPressEnter(event);
        }
      }}
      {...props}
    />
  ),
  Popconfirm: ({ children, onConfirm }: any) => (
    <span
      onClick={() => {
        onConfirm();
      }}>
      {children}
    </span>
  ),
  notification: {
    success: jest.fn(),
  },
}));

describe('TagIndex', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (TagApi.create as jest.Mock).mockResolvedValue({});
    (TagApi.delete as jest.Mock).mockResolvedValue({});
  });

  test('creates a tag from inline input', async () => {
    render(<TagIndex />);

    fireEvent.click(screen.getByText('添加新标签'));
    fireEvent.change(screen.getByLabelText('tag-input'), { target: { value: 'typescript' } });
    fireEvent.keyDown(screen.getByLabelText('tag-input'), { key: 'Enter' });

    await waitFor(() => expect(TagApi.create).toHaveBeenCalledWith({ name: 'typescript' }));
    expect(mockRun).toHaveBeenCalled();
  });

  test('deletes an existing tag through confirm', async () => {
    render(<TagIndex />);

    fireEvent.click(screen.getByText('close tag'));

    await waitFor(() => expect(TagApi.delete).toHaveBeenCalledWith(1));
    expect(mockRun).toHaveBeenCalled();
  });
});
