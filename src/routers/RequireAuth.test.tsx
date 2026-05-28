import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import RequireAuth from './RequireAuth';

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
      </Routes>
    </MemoryRouter>
  );

describe('RequireAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders children when token exists', () => {
    localStorage.setItem('user', JSON.stringify({ token: 'abc' }));

    renderWithRoutes();

    expect(screen.getByText('private content')).toBeInTheDocument();
  });

  test('redirects to login without a token', () => {
    renderWithRoutes();

    expect(screen.getByText('login page')).toBeInTheDocument();
  });
});
