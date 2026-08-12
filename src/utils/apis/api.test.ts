import axios from '../myaxios';

import { ArticleApi } from './article';
import { CategoryApi } from './category';
import { CommentApi } from './comment';
import { DashboardApi } from './dashboard';
import { SettingApi } from './setting';
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

describe('ArticleApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses article revision endpoints', () => {
    ArticleApi.revisions(12);
    expect(mockedAxios.get).toHaveBeenCalledWith('/articles/12/revisions');

    ArticleApi.restoreRevision(12, 4);
    expect(mockedAxios.post).toHaveBeenCalledWith('/articles/12/revisions/4/restore');
  });
});

describe('CommentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('passes list filters and administrator replies', () => {
    const params = {
      page: 2,
      page_size: 20,
      keyword: 'Alice',
      article_id: 17,
      date_from: '2026-05-01',
      date_to: '2026-05-31',
    };
    CommentApi.getList(params);
    expect(mockedAxios.get).toHaveBeenCalledWith('/comments', { params });

    CommentApi.reply(8, 'Thanks');
    expect(mockedAxios.post).toHaveBeenCalledWith('/comments/8/reply', { content: 'Thanks' });
  });
});

describe('DashboardApi', () => {
  test('uses the dashboard endpoint', () => {
    DashboardApi.get();
    expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard');
  });
});

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

  test('sends value, description and visibility when updating setting', () => {
    SettingApi.updateValue('SiteTitle', 'Myecho', 'site title', false);

    expect(mockedAxios.patch).toHaveBeenCalledWith('/settings/SiteTitle', {
      value: 'Myecho',
      description: 'site title',
      is_public: false,
    });
  });

  test('uses expected settings endpoints', () => {
    SettingApi.getAll();
    expect(mockedAxios.get).toHaveBeenCalledWith('/settings');

    SettingApi.getAdminAll();
    expect(mockedAxios.get).toHaveBeenCalledWith('/settings/admin');

    SettingApi.get('SiteTitle');
    expect(mockedAxios.get).toHaveBeenCalledWith('/settings/SiteTitle');

    SettingApi.delete('SiteTitle');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/settings/SiteTitle');

    SettingApi.create({ key: 'SiteDescription', value: 'A blog', type: 'string', description: '站点描述' });
    expect(mockedAxios.post).toHaveBeenCalledWith('/settings', {
      key: 'SiteDescription',
      value: 'A blog',
      type: 'string',
      description: '站点描述',
    });

    SettingApi.exportBackup();
    expect(mockedAxios.get).toHaveBeenCalledWith('/export', {
      responseType: 'blob',
      timeout: 0,
    });

    const backup = new File(['backup'], 'backup.zip', { type: 'application/zip' });
    SettingApi.importBackup(backup, true);
    expect(mockedAxios.post).toHaveBeenCalledWith('/import', expect.any(FormData), {
      params: { dry_run: true },
      timeout: 0,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });
});

describe('UserApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses profile, password and token revocation endpoints', () => {
    UserApi.profile();
    expect(mockedAxios.get).toHaveBeenCalledWith('/account/profile');

    UserApi.updateProfile({ nick_name: 'Admin', email: 'admin@example.com' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/account/profile', {
      nick_name: 'Admin',
      email: 'admin@example.com',
    });

    UserApi.updatePassword({ old_password: 'old-pass', new_password: 'new-pass-123' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/account/password', {
      old_password: 'old-pass',
      new_password: 'new-pass-123',
    });

    UserApi.logout('abc');
    expect(mockedAxios.post).toHaveBeenCalledWith('/logout', undefined, {
      headers: { Authorization: 'token abc' },
    });
  });
});
