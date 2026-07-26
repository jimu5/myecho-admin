import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import RequireAuth from './RequireAuth';
import { UserApi } from '@/utils/apis/user';

jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    setupStatus: jest.fn(),
  },
}), { virtual: true });

const renderWithRoutes = () =>
  render(
    <MemoryRouter initialEntries={['/private']}>
      <Routes>
        <Route
          path="/private"
          element={
            <RequireAuth>
              <div>private content</div>
            </RequireAuth>
          }
        />
        <Route path="/admin/login" element={<div>login page</div>} />
        <Route path="/admin/setup" element={<div>setup page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (UserApi.setupStatus as jest.Mock).mockResolvedValue({ needs_setup: false });
  });

  test('renders children when token exists', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc' }));

    renderWithRoutes();

    expect(screen.getByText('private content')).toBeInTheDocument();
  });

  test('checks setup status before redirecting to login without a token', async () => {
    renderWithRoutes();

    expect(screen.getByText('正在检查站点状态...')).toBeInTheDocument();
    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  test('redirects first-time installations to setup', async () => {
    (UserApi.setupStatus as jest.Mock).mockResolvedValue({ needs_setup: true });

    renderWithRoutes();

    expect(await screen.findByText('setup page')).toBeInTheDocument();
  });

  test('shows a retry action when setup status cannot be checked', async () => {
    (UserApi.setupStatus as jest.Mock).mockRejectedValue(new Error('offline'));

    renderWithRoutes();

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('无法检查站点状态'));
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });
});
