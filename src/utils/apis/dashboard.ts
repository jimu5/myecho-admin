import axios from '../myaxios';
import { article } from './article';

export interface dashboardData {
  article_count: number;
  draft_count: number;
  pending_comment_count: number;
  scheduled_count: number;
  view_count_7_days: number;
  view_count_30_days: number;
  comment_count_7_days: number;
  comment_count_30_days: number;
  scheduled_articles: article[];
  popular_articles: article[];
  recent_articles: article[];
}

export class DashboardApi {
  static get(): Promise<dashboardData> {
    return axios.get<any, dashboardData>('/dashboard');
  }
}
