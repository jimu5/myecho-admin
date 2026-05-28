import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import Myheader from './index';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Dropdown: ({ overlay, children }: any) => (
      <div>
        {children}
        {overlay}
      </div>
    ),
    Menu: ({ items }: any) => (
      <div>
        {items.map((item: any) => (
          <div key={item.key}>{item.label}</div>
        ))}
      </div>
    ),
  };
});

describe('Myheader', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  test('shows current nickname and clears login state on logout', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc', nick_name: 'Admin' }));

    render(<Myheader />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
    fireEvent.click(screen.getByText('退出'));

    expect(localStorage.getItem('user')).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login', { replace: true });
  });
});
