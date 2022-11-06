import React from 'react';

import Category  from '@/components/Category';
import { CategoryApi } from '@/utils/apis/category';

const LinkCategory: React.FC = () => {
  return (
    <Category getAllMethod={CategoryApi.getLinkList} CreateMethod={CategoryApi.createLink} ></Category>
  )
}

export default LinkCategory;
