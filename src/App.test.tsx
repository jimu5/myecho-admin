import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App';

jest.mock('react-redux', () => ({
  connect: () => (Component: React.ComponentType) => Component,
}));

jest.mock(
  '@/routers/routerMap',
  () => {
    const React = require('react');
    return [
      { path: '/admin', element: React.createElement('div', null, 'admin main') },
      { path: '/admin/login', element: React.createElement('div', null, 'login page') },
    ];
  },
  { virtual: true }
);

describe('App routes', () => {
  test('renders route elements from router map', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/login']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('login page')).toBeInTheDocument();
  });

  test('renders admin route from router map', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('admin main')).toBeInTheDocument();
  });
});
