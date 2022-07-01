import React from 'react';
import { Table } from 'antd';
import { usePagination } from 'ahooks';

import { ArticleApi, article } from '@/utils/apis/article';

import columns from './column';

const All: React.FC = () => {
  async function getArticleList(params: {
    current: number;
    pageSize: number;
  }): Promise<{ total: number; list: article[] }> {
    return ArticleApi.getList({
      page: params.current,
      page_size: params.pageSize,
    }).then((data: any) => {
      return { total: data.total, list: data.data };
    });
  }

  const { data, loading, pagination } = usePagination(getArticleList);

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data?.list}
        loading={loading}
        pagination={{
          total: data?.total,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: pagination.onChange,
        }}
      />
    </div>
  );
};

export default All;
