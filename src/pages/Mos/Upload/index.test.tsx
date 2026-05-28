import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import UploadFile from './index';

jest.mock(
  '@/utils/apis/mos',
  () => ({
    MosAPI: {
      delete: jest.fn(),
    },
  }),
  { virtual: true }
);

jest.mock(
  '@/utils/myaxios',
  () => ({
    getAuthHeaders: jest.fn(() => ({ Authorization: 'token abc' })),
  }),
  { virtual: true }
);

jest.mock('@ant-design/icons', () => ({
  InboxOutlined: () => <span>inbox icon</span>,
}));

jest.mock('antd', () => ({
  Upload: {
    Dragger: ({ action, headers, multiple, onRemove, children }: any) => (
      <div>
        <div data-testid="upload-action">{action}</div>
        <div data-testid="upload-headers">{JSON.stringify(headers)}</div>
        <div data-testid="upload-multiple">{String(multiple)}</div>
        <button onClick={() => onRemove({ response: { id: 12 } })}>remove file</button>
        {children}
      </div>
    ),
  },
}));

const { MosAPI } = jest.requireMock('@/utils/apis/mos');
const { getAuthHeaders: mockGetAuthHeaders } = jest.requireMock('@/utils/myaxios');
const mockDelete = MosAPI.delete as jest.Mock;

describe('UploadFile', () => {
  beforeEach(() => {
    mockDelete.mockClear();
    mockGetAuthHeaders.mockClear();
    mockGetAuthHeaders.mockReturnValue({ Authorization: 'token abc' });
  });

  test('passes auth headers and deletes removed uploaded file', () => {
    render(<UploadFile />);

    expect(screen.getByTestId('upload-action')).toHaveTextContent('/mos/files/upload');
    expect(screen.getByTestId('upload-headers')).toHaveTextContent('token abc');
    expect(screen.getByTestId('upload-multiple')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('remove file'));

    expect(mockGetAuthHeaders).toHaveBeenCalled();
    expect(mockDelete).toHaveBeenCalledWith(12);
  });
});
