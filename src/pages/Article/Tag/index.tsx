import React from 'react';
import { Tag } from 'antd';
import { useRequest } from 'ahooks';

import { tag, TagApi } from '@/utils/apis/tag';

const TagIndex: React.FC = () => {
  const { data, loading } = useRequest(() => TagApi.getList());

  return (
    <div>
      <h1>tags</h1>
      {data?.map((item: tag) => (
        <Tag key={item.id}>{item.name}</Tag>
      ))}
    </div>
  );
};

export default TagIndex;
