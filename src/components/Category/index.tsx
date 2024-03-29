import React, { useCallback } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { category } from '@/utils/apis/category';

import CreateBox from './create_box';

interface props {
  getAllMethod(): Promise<category[]>;
  CreateMethod(arg: any): Promise<any>;
}

const Category: React.FC<props> = ( { getAllMethod, CreateMethod}) => {
  const { data, runAsync } = useRequest<category[], any>(() =>
    getAllMethod().then((data) => {
      buildTree(data);
      return data;
    })
  );
  const [tree, setTree] = useSafeState<DataNode[]>([]);

  const buildTree = useCallback(
    (data: any) => {
      const tree: DataNode[] = [];
      data.forEach((item: category) => {
        if (item.father_uid === "" || item.father_uid === null) {
          tree.push({
            title: item.name,
            key: item.uid,
            children: [],
          });
        } else {
          const parent = tree.find((i: any) => i.key === item.father_uid);
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
      <CreateBox CreateMethod={CreateMethod} data={data || []} runAsync={runAsync} />
      <Tree treeData={tree}></Tree>
    </div>
  );
};

export default Category;
