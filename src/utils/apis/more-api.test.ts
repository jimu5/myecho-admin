import axios from '../myaxios';

import { ArticleApi } from './article';
import { CommentApi } from './comment';
import { MosAPI, File } from './mos';

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

describe('ArticleApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses expected article endpoints', () => {
    ArticleApi.getList({ page: 1, page_size: 10 });
    expect(mockedAxios.get).toHaveBeenCalledWith('/articles', { params: { page: 1, page_size: 10 } });

    ArticleApi.getAllList({ page: 2, page_size: 5 });
    expect(mockedAxios.get).toHaveBeenCalledWith('all_articles', { params: { page: 2, page_size: 5 } });

    ArticleApi.create({ title: 'Title' });
    expect(mockedAxios.post).toHaveBeenCalledWith('articles', { title: 'Title' });

    ArticleApi.get(7);
    expect(mockedAxios.get).toHaveBeenCalledWith('/articles/7');

    ArticleApi.get_no_read(8);
    expect(mockedAxios.get).toHaveBeenCalledWith('/articles/8?no_read=true');

    ArticleApi.delete(9);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/articles/9');

    ArticleApi.batch({ ids: [1, 2], action: 'status', status: 4 });
    expect(mockedAxios.post).toHaveBeenCalledWith('articles/batch', { ids: [1, 2], action: 'status', status: 4 });

    ArticleApi.unlockPassword(7, 'secret');
    expect(mockedAxios.post).toHaveBeenCalledWith('/articles/7/password', { password: 'secret' });
  });

  test('patch defaults invalid article status to public', () => {
    ArticleApi.patch(3, { title: 'Title', status: 99 });

    expect(mockedAxios.patch).toHaveBeenCalledWith('/articles/3', { title: 'Title', status: 1 });
  });

  test('patch preserves valid article status and defaults missing status', () => {
    ArticleApi.patch(4, { title: 'Pinned', status: 2 });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/articles/4', { title: 'Pinned', status: 2 });

    ArticleApi.patch(5, { title: 'No status' });
    expect(mockedAxios.patch).toHaveBeenCalledWith('/articles/5', { title: 'No status', status: 1 });
  });
});

describe('CommentApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses expected comment moderation endpoints', () => {
    CommentApi.getList({ page: 1, page_size: 10, status: 1 });
    expect(mockedAxios.get).toHaveBeenCalledWith('/comments', { params: { page: 1, page_size: 10, status: 1 } });

    CommentApi.update(3, { status: 2 } as any);
    expect(mockedAxios.patch).toHaveBeenCalledWith('/comments/3', { status: 2 });

    CommentApi.batch({ ids: [3], action: 'status', status: 2 });
    expect(mockedAxios.post).toHaveBeenCalledWith('/comments/batch', { ids: [3], action: 'status', status: 2 });

    CommentApi.delete(3);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/comments/3');
  });
});

describe('MosAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses mos baseURL override for file APIs', () => {
    MosAPI.delete(4);
    expect(mockedAxios.delete).toHaveBeenCalledWith('/mos/files/4', { baseURL: '' });

    MosAPI.getList(1, 10);
    expect(mockedAxios.get).toHaveBeenCalledWith('/mos/files', {
      params: { page: 1, page_size: 10, name: '' },
      baseURL: '',
    });

    MosAPI.getList(2, 20, 'avatar');
    expect(mockedAxios.get).toHaveBeenCalledWith('/mos/files', {
      params: { page: 2, page_size: 20, name: 'avatar' },
      baseURL: '',
    });
  });

  test('updates file metadata', () => {
    const file = { id: 5, full_name: 'avatar.png' } as File;

    MosAPI.Update(file);

    expect(mockedAxios.put).toHaveBeenCalledWith('/mos/files/5', file, { baseURL: '' });
  });
});
