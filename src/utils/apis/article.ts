import axios from '../axios';
import { user } from './user';
import baseReturn from './baseReturn';

// 文章详情
export interface articleDetail {
    id: number;
    content: string;
}

// 文章状态
export const articleStatus = {
    1: '已发布',
    2: '置顶',
    3: '草稿',
    4: '等待复审',
    5: '仅自己可见',
    6: '回收站'
}

// 单个文章的结构
export interface article extends baseReturn {
    author: user;
    title: string;
    summary: string;
    detail: articleDetail;
    category: string;
    is_allow_comment: boolean;
    read_count: number;
    like_count: number;
    comment_count: number;
    post_time: string;
    status: number;
}

export interface articleRequest {
    title?: string;
    summary?: string;
    content?: string;
    category_id?: number;
    is_allow_comment?: boolean;
    post_time?: string;
    status?: number;
    password?: string;
}

export class ArticleApi {
    // 获取文章列表
    static getList(params: { page: number; page_size: number;}) {
        return axios.get('/articles', { params });
    }
    static create(params: articleRequest) {
        return axios.post('articles', params);
    }
    static patch(id: number, params: articleRequest) {
        return axios.patch(`/articles/${id}`, params);
    }
}
