import React from 'react';

import Category  from '@/components/Category';
import { CategoryApi } from '@/utils/apis/category';

const LinkCategory: React.FC = () => {
  return (
    <Category
      getAllMethod={CategoryApi.getLinkList}
      CreateMethod={CategoryApi.createLink}
      title="链接分类"
      subtitle="整理友链分组，让外部链接展示更清晰。"
    ></Category>
  )
}

export default LinkCategory;
