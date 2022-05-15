import axios from '../axios';
import { user } from './user';
import baseReturn from './baseReturn';

// 文章详情
export interface articleDetail {
    id: number;
    content: string;
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

export class ArticleApi {
    // 获取文章列表
    static getList(params: { page: number; page_size: number;}) {
        return axios.get('/articles', { params });
    }
}
