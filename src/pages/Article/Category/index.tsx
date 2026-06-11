import React from 'react';

import Category  from '@/components/Category';
import { CategoryApi } from '@/utils/apis/category';

const ArticleCategory: React.FC = () => {
  return (
    <Category
      getAllMethod={CategoryApi.getArticleList}
      CreateMethod={CategoryApi.createArticle}
      title="文章分类"
      subtitle="整理文章归档结构，帮助读者按主题浏览内容。"
    ></Category>
  )
}

export default ArticleCategory;
