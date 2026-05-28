import axios from '../myaxios';

import { LinkAPI, Link } from './link';
import { TagApi } from './tag';

jest.mock('../myaxios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LinkAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('gets all links with and without category filter', () => {
    LinkAPI.getAll();
    expect(mockedAxios.get).toHaveBeenCalledWith('/links');

    LinkAPI.getAll('cat-uid');
    expect(mockedAxios.get).toHaveBeenCalledWith('/links?category_uid=cat-uid');
  });

  test('creates, updates and deletes links', () => {
    const link = { id: 3, name: 'Go', url: 'https://go.dev' } as Link;

    LinkAPI.create(link);
    expect(mockedAxios.post).toHaveBeenCalledWith('/links', link);

    LinkAPI.put(3, link);
    expect(mockedAxios.put).toHaveBeenCalledWith('/links/3', link);

    LinkAPI.delete(3);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/links/3');
  });
});

describe('TagApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses expected tag endpoints', () => {
    TagApi.getList();
    expect(mockedAxios.get).toHaveBeenCalledWith('/tags/all');

    TagApi.get(1);
    expect(mockedAxios.get).toHaveBeenCalledWith('/tags/1');

    TagApi.create({ name: 'go' });
    expect(mockedAxios.post).toHaveBeenCalledWith('/tags', { name: 'go' });

    TagApi.patch(2, { name: 'js' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/tags/2', { name: 'js' });

    TagApi.delete(3);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/tags/3');
  });
});
