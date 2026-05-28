import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import Setting from './index';
import { SettingApi } from '@/utils/apis/setting';

jest.mock('@/utils/apis/setting', () => ({
  SettingApi: {
    getAll: jest.fn(),
    updateValue: jest.fn(),
    delete: jest.fn(),
  },
}), { virtual: true });

jest.mock('./modalCreate', () => ({ open, okCallBack }: any) => (
  <div>
    <span>{open ? 'modal open' : 'modal closed'}</span>
    <button onClick={() => okCallBack()}>modal callback</button>
  </div>
));

jest.mock('ahooks', () => {
  const React = require('react');

  return {
    useSafeState: React.useState,
    useRequest: (service: any) => {
      const serviceRef = React.useRef(service);
      const [loading, setLoading] = React.useState(true);
      serviceRef.current = service;

      const runAsync = React.useCallback(() => {
        setLoading(true);
        return Promise.resolve(serviceRef.current()).finally(() => setLoading(false));
      }, []);

      React.useEffect(() => {
        runAsync();
      }, [runAsync]);

      return { runAsync, loading };
    },
  };
});

jest.mock('@ant-design/pro-table', () => ({
  EditableProTable: ({ value, editable, columns, onChange }: any) => {
    const first = value[0];

    return (
      <div>
        <span data-testid="setting-count">{value.length}</span>
        {first && (
          <>
            <button onClick={() => editable.onSave(1, first, first)}>save setting</button>
            <button onClick={() => onChange([{ ...first, value: 'changed' }])}>change table</button>
            <div data-testid="setting-actions">
              {columns[4].render(null, first, 0, { startEditable: jest.fn() })}
            </div>
          </>
        )}
      </div>
    );
  },
}));

jest.mock('antd', () => ({
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  Space: ({ children }: any) => <div>{children}</div>,
  Popconfirm: ({ children, onConfirm }: any) => (
    <span onClick={onConfirm}>{children}</span>
  ),
  message: {
    success: jest.fn(),
  },
}));

const renderSetting = async () => {
  await act(async () => {
    render(<Setting />);
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('Setting page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SettingApi.getAll as jest.Mock).mockResolvedValue([
      { id: 1, key: 'SiteTitle', value: 'Myecho', description: 'site', type: 'string', is_system: true },
    ]);
    (SettingApi.updateValue as jest.Mock).mockResolvedValue({});
    (SettingApi.delete as jest.Mock).mockResolvedValue({});
  });

  test('loads settings and saves edited value', async () => {
    await renderSetting();

    await waitFor(() => expect(screen.getByTestId('setting-count')).toHaveTextContent('1'));
    fireEvent.click(screen.getByText('save setting'));

    expect(SettingApi.updateValue).toHaveBeenCalledWith('SiteTitle', 'Myecho', 'site');
  });

  test('deletes a setting and refreshes list', async () => {
    await renderSetting();

    await waitFor(() => expect(screen.getByTestId('setting-actions')).toBeInTheDocument());
    await act(async () => {
      fireEvent.click(screen.getByText('删除'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(SettingApi.delete).toHaveBeenCalledWith('SiteTitle'));
    expect(SettingApi.getAll).toHaveBeenCalledTimes(2);
  });

  test('opens create modal and wires callback to refresh', async () => {
    await renderSetting();

    expect(screen.getByText('modal closed')).toBeInTheDocument();
    fireEvent.click(screen.getByText('创建新的'));

    expect(screen.getByText('modal open')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText('modal callback'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => expect(SettingApi.getAll).toHaveBeenCalledTimes(2));
  });
});
