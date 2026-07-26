import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import Login from './index';
import { UserApi } from '@/utils/apis/user';
import { redirectToSetup } from '@/utils/navigation';

jest.mock('./Box', () => () => <div>login-box</div>);
jest.mock('@/utils/apis/user', () => ({
  UserApi: {
    setupStatus: jest.fn(),
  },
}), { virtual: true });
jest.mock('@/utils/navigation', () => ({
  redirectToSetup: jest.fn(),
}), { virtual: true });

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login after setup status succeeds', async () => {
    (UserApi.setupStatus as jest.Mock).mockResolvedValue({ needs_setup: false });

    render(<Login />);

    expect(screen.getByText('正在检查站点状态...')).toBeInTheDocument();
    expect(await screen.findByText('login-box')).toBeInTheDocument();
    expect(redirectToSetup).not.toHaveBeenCalled();
  });

  test('redirects first-time installations to setup', async () => {
    (UserApi.setupStatus as jest.Mock).mockResolvedValue({ needs_setup: true });

    render(<Login />);

    await waitFor(() => expect(redirectToSetup).toHaveBeenCalledTimes(1));
  });

  test('shows a retry action when setup status fails', async () => {
    (UserApi.setupStatus as jest.Mock).mockRejectedValue(new Error('offline'));

    render(<Login />);

    expect(await screen.findByRole('alert')).toHaveTextContent('无法检查站点状态');
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument();
  });
});
