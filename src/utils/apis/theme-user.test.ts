import axios from '../myaxios';

import { ThemeApi } from './theme';
import { UserApi } from './user';

jest.mock('../myaxios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('posts login payload', () => {
    UserApi.login({ email: 'admin@example.com', name: '', password: 'secret' });

    expect(mockedAxios.post).toHaveBeenCalledWith('/login', {
      email: 'admin@example.com',
      name: '',
      password: 'secret',
    });
  });
});

describe('ThemeApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses expected theme endpoints', () => {
    ThemeApi.getAll();
    expect(mockedAxios.get).toHaveBeenCalledWith('/themes');

    ThemeApi.get(2);
    expect(mockedAxios.get).toHaveBeenCalledWith('/themes/2');

    ThemeApi.create({ name: 'clean' });
    expect(mockedAxios.post).toHaveBeenCalledWith('/themes', { name: 'clean' });

    ThemeApi.update(3, { display_name: 'Clean' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/themes/3', { display_name: 'Clean' });

    ThemeApi.delete(4);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/themes/4');

    ThemeApi.activate(5);
    expect(mockedAxios.post).toHaveBeenCalledWith('/themes/5/activate');

    ThemeApi.getActive();
    expect(mockedAxios.get).toHaveBeenCalledWith('/themes/active');

    ThemeApi.updateConfig(6, { primaryColor: '#111' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/themes/6/config', { primaryColor: '#111' });
  });

  test('uploads theme zip as multipart form data', () => {
    const file = new Blob(['zip']);

    ThemeApi.upload(file);

    expect(mockedAxios.post).toHaveBeenCalledWith('/themes/upload', expect.any(FormData), {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
  });
});
