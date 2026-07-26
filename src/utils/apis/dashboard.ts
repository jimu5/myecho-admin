import axios from '../myaxios';
import { article } from './article';

export interface dashboardData {
  article_count: number;
  draft_count: number;
  pending_comment_count: number;
  popular_articles: article[];
  recent_articles: article[];
}

export class DashboardApi {
  static get(): Promise<dashboardData> {
    return axios.get<any, dashboardData>('/dashboard');
  }
}
