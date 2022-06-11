import React, { useCallback } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { CategoryApi, category } from '@/utils/apis/category';

import CreateBox from './create_box';

const Category: React.FC = () => {
  const { data, runAsync } = useRequest<category[], any>(() =>
    CategoryApi.getList().then((data) => {
      buildTree(data);
      return data;
    })
  );
  const [tree, setTree] = useSafeState<DataNode[]>([]);

  const buildTree = useCallback(
    (data: any) => {
      const tree: DataNode[] = [];
      data.forEach((item: category) => {
        if (item.father_id === 0 || item.father_id === null) {
          tree.push({
            title: item.name,
            key: item.id,
            children: [],
          });
        } else {
          const parent = tree.find((i: any) => i.key === item.father_id);
          if (parent) {
            parent.children!.push({
              title: item.name,
              key: item.id,
              children: [],
            });
          }
        }
      });
      setTree(tree);
    },
    [setTree]
  );

  return (
    <div>
      <CreateBox data={data || []} runAsync={runAsync} />
      <Tree treeData={tree}></Tree>
    </div>
  );
};

export default Category;
