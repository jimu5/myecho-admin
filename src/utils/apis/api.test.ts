import axios from '../myaxios';

import { CategoryApi } from './category';
import { SettingApi } from './setting';

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

describe('CategoryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses UID based category payloads', () => {
    CategoryApi.createArticle({ name: 'Go', father_uid: 'root' });
    expect(mockedAxios.post).toHaveBeenCalledWith('/article/categories', { name: 'Go', father_uid: 'root' });

    CategoryApi.patch(3, { name: 'Updated', father_uid: null });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/categories/3', { name: 'Updated', father_uid: null });
  });

  test('requests category lists and deletes by id', () => {
    CategoryApi.getArticleList();
    expect(mockedAxios.get).toHaveBeenCalledWith('/article/categories/all');

    CategoryApi.getLinkList();
    expect(mockedAxios.get).toHaveBeenCalledWith('/link/categories/all');

    CategoryApi.delete(9);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/categories/9');
  });
});

describe('SettingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sends value and description when updating setting', () => {
    SettingApi.updateValue('SiteTitle', 'Myecho', 'site title');

    expect(mockedAxios.patch).toHaveBeenCalledWith('/settings/SiteTitle', {
      value: 'Myecho',
      description: 'site title',
    });
  });

  test('uses expected settings endpoints', () => {
    SettingApi.getAll();
    expect(mockedAxios.get).toHaveBeenCalledWith('/settings');

    SettingApi.get('SiteTitle');
    expect(mockedAxios.get).toHaveBeenCalledWith('/settings/SiteTitle');

    SettingApi.delete('SiteTitle');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/settings/SiteTitle');
  });
});
