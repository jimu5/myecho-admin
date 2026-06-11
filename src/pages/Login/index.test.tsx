import React from 'react';
import { render, screen } from '@testing-library/react';

import Login from './index';

jest.mock('./Box', () => () => <div>login-box</div>);

describe('Login', () => {
  test('renders login box shell', () => {
    render(<Login />);

    expect(screen.getByText('login-box')).toBeInTheDocument();
  });
});
