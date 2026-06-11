import axios from '../myaxios';
import baseReturn from './baseReturn';

export const commentStatus = new Map([
  [1, '待审核'],
  [2, '已通过'],
  [3, '已拒绝'],
  [4, '垃圾评论'],
]);

export interface comment extends baseReturn {
  article_uid: string;
  article_id: number;
  article_title: string;
  author_name: string;
  author_email: string;
  author_ip: string;
  author_url: string;
  author_agent: string;
  content: string;
  status: number;
  like_count: number;
  parent_id: number;
  replies?: comment[];
  user_id: number;
  post_time: string;
}

export interface commentListParams {
  page: number;
  page_size: number;
  status?: number;
  article_id?: number;
  article_uid?: string;
}

export class CommentApi {
  static getList(params: commentListParams) {
    return axios.get('/comments', { params });
  }

  static update(id: number, params: Partial<comment>) {
    return axios.patch(`/comments/${id}`, params);
  }

  static batch(params: { ids: number[]; action: string; status?: number }) {
    return axios.post('/comments/batch', params);
  }

  static delete(id: number) {
    return axios.delete(`/comments/${id}`);
  }
}
