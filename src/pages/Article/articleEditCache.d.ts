import { tag } from '@/utils/apis/tag';

export default interface ArticleEditCache {
  title?: string;
  post_time?: string;
  is_allow_comment?: boolean;
  status?: number;
  category_uuid?: string;
  password?: string;
  summary?: string;
  tags?: tag[];
  visibility?: number;
}