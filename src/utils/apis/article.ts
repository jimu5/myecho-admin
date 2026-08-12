import axios from '../myaxios';
import { user } from './user';
import baseReturn from './baseReturn';
import { tag } from './tag';
import { category } from './category';

// 文章详情
export interface articleDetail {
    id: number;
    content: string;
}

// 文章状态
export const articleStatus = new Map([
    [1, '公开'],
    [2, '置顶'],
    [3, '私密'],
    [4, '草稿'],
    [5, '等待复审'],
    [6, '回收站']
])

export const articlePublishStatus = new Map([
    [4, '草稿'],
    [1, '公开'],
    [2, '置顶'],
])

export const isScheduledArticle = (item?: { status?: number; post_time?: string }) =>
    Boolean(item?.post_time && (item.status === 1 || item.status === 2) && new Date(item.post_time).getTime() > Date.now());

export const getArticleStatusLabel = (status?: number, postTime?: string) =>
    isScheduledArticle({ status, post_time: postTime }) ? '定时发布' : articleStatus.get(status || 0) || '未知';

export const canPreviewArticle = (status?: number, postTime?: string) =>
    (status === 1 || status === 2) && !isScheduledArticle({ status, post_time: postTime });

export const articleTypes = new Map([
    [1, '文章'],
    [2, '页面']
])

export type ArticleContentFormat = 'markdown' | 'html';

export const articleContentFormats = new Map<ArticleContentFormat, string>([
    ['markdown', 'Markdown'],
    ['html', 'HTML']
])

// 单个文章的结构
export interface article extends baseReturn {
    author: user;
    title: string;
    slug: string;
    seo_title: string;
    seo_description: string;
    share_image: string;
    content_format: ArticleContentFormat;
    summary: string;
    detail: articleDetail;
    category_uid: string;
    category?: category;
    is_allow_comment: boolean;
    is_password_protected: boolean;
    read_count: number;
    like_count: number;
    comment_count: number;
    post_time: string;
    status: number;
    type: number;
    visibility: number;
    tags: tag[];
}

export interface articleRequest {
    title?: string;
    slug?: string;
    seo_title?: string;
    seo_description?: string;
    share_image?: string;
    content_format?: ArticleContentFormat;
    summary?: string;
    content?: string;
    category_uid?: string;
    is_allow_comment?: boolean;
    post_time?: string;
    status?: number;
    type?: number;
    password?: string;
    clear_password?: boolean;
    tag_uids?: string[];
    visibility?: number;
}

export interface articleListParams {
    page: number;
    page_size: number;
    keyword?: string;
    status?: number;
    type?: number;
    category_uid?: string;
    tag_uid?: string;
    date_from?: string;
    date_to?: string;
}

export interface articleBatchRequest {
    ids: number[];
    action: 'delete' | 'status' | 'update_status';
    status?: number;
}

export interface articleRevision {
    id: number;
    title: string;
    slug: string;
    created_at: string;
}

export class ArticleApi {
    // 获取文章列表
    static getList(params: articleListParams) {
        return axios.get('/articles', { params });
    }
    static getAllList(params: articleListParams) {
        return axios.get("all_articles", { params })
    }
    static batch(params: articleBatchRequest) {
        return axios.post('articles/batch', params);
    }
    static create(params: articleRequest) {
        return axios.post('articles', params);
    }
    static get(id: number) {
        return axios.get(`/articles/${id}`);
    }
    static get_no_read(id: number) {
        return axios.get(`/articles/${id}?no_read=true`)
    }
    static unlockPassword(id: number, password: string) {
        return axios.post(`/articles/${id}/password`, { password });
    }
    static delete(id: number) {
        return axios.delete(`/articles/${id}`);
    }
    static patch(id: number, params: articleRequest) {
        ArticleApi._set_param_default(params)
        return axios.patch(`/articles/${id}`, params);
    }
    static revisions(id: number): Promise<articleRevision[]> {
        return axios.get<any, articleRevision[]>(`/articles/${id}/revisions`);
    }
    static restoreRevision(id: number, revisionId: number): Promise<article> {
        return axios.post<any, article>(`/articles/${id}/revisions/${revisionId}/restore`);
    }

    static _set_param_default(params: articleRequest) {
        if ((params.status == null) || !Array.from(articleStatus.keys()).includes(params.status)) {
            params.status = 1
        }
    }
}
