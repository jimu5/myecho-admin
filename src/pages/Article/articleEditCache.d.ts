import { tag } from '@/utils/apis/tag';

export default interface ArticleEditCache {
  title?: string;
  slug?: string;
  type?: number;
  post_time?: string;
  is_allow_comment?: boolean;
  status?: number;
  category_uid?: string;
  password?: string;
  clear_password?: boolean;
  summary?: string;
  tags?: tag[];
  visibility?: number;
}
