import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import AdminNavLink from './AdminNavlink';

describe('AdminNavLink', () => {
  test('prefixes admin route', () => {
    render(
      <MemoryRouter>
        <AdminNavLink to="setting">Setting</AdminNavLink>
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: 'Setting' })).toHaveAttribute('href', '/admin/setting');
  });
});
