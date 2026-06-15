import { tag } from '@/utils/apis/tag';
import { ArticleContentFormat } from '@/utils/apis/article';

export default interface ArticleEditCache {
  title?: string;
  slug?: string;
  type?: number;
  content_format?: ArticleContentFormat;
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
