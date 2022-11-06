import React from 'react';

import Category  from '@/components/Category';
import { CategoryApi } from '@/utils/apis/category';

const ArticleCategory: React.FC = () => {
  return (
    <Category getAllMethod={CategoryApi.getArticleList} CreateMethod={CategoryApi.createArticle} ></Category>
  )
}

export default ArticleCategory;
