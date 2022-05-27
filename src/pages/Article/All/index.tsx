import React from 'react';
import { Table } from 'antd';
import { useRequest, useSafeState } from 'ahooks';

import { ArticleApi, article } from '@/utils/apis/article';

import columns from './column';


const All: React.FC = () => {
  const [page, set_page] = useSafeState(1);
  const [page_size, set_page_size] = useSafeState(10);
  const [data, set_data] = useSafeState<article[]>([]);
  const { loading, runAsync } = useRequest(() =>
    ArticleApi.getList({ page, page_size }).then((data) => {
      set_data(data.data);
    })
  );

  return (
    <div>
      <Table columns={columns} dataSource={data} loading={loading} />
    </div>
  );
};

export default All;
