import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import CreateBox from './create_box';

jest.mock('ahooks', () => {
  const React = require('react');
  return {
    useSafeState: React.useState,
  };
});

jest.mock('antd', () => {
  const Select: any = ({ children, onChange }: any) => (
    <div>
      <button onClick={() => onChange('root')}>select-root</button>
      {children}
    </div>
  );
  Select.Option = ({ children }: any) => <span>{children}</span>;

  return {
    Select,
    Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
    Input: ({ onChange }: any) => <input aria-label="category-name" onChange={onChange} />,
    notification: {
      success: jest.fn(),
    },
  };
});

describe('Category CreateBox', () => {
  test('creates category and refreshes list', async () => {
    const CreateMethod = jest.fn().mockResolvedValue({});
    const runAsync = jest.fn();
    render(
      <CreateBox
        data={[
          { uid: 'root', name: 'Root', father_uid: '' } as any,
          { uid: 'child', name: 'Child', father_uid: 'root' } as any,
        ]}
        runAsync={runAsync}
        CreateMethod={CreateMethod}
      />
    );

    fireEvent.click(screen.getByText('select-root'));
    fireEvent.change(screen.getByLabelText('category-name'), { target: { value: 'New Category' } });
    fireEvent.click(screen.getByText('创建'));

    await waitFor(() =>
      expect(CreateMethod).toHaveBeenCalledWith({ name: 'New Category', father_uid: 'root' })
    );
    expect(runAsync).toHaveBeenCalled();
    expect(screen.getByText(/Root/)).toBeInTheDocument();
    expect(screen.queryByText(/Child/)).not.toBeInTheDocument();
  });
});
