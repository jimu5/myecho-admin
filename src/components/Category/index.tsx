import React, { useCallback } from 'react';
import { useRequest, useSafeState } from 'ahooks';
import { Tree } from 'antd';
import type { DataNode } from 'antd/lib/tree';

import { category } from '@/utils/apis/category';

import CreateBox from './create_box';

interface props {
  getAllMethod(): Promise<category[]>;
  CreateMethod(arg: any): Promise<any>;
  title?: string;
  subtitle?: string;
}

const Category: React.FC<props> = ( { getAllMethod, CreateMethod, title = '分类管理', subtitle = '创建和整理站点内容分类。' }) => {
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
              key: item.uid,
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
    <div className="admin-page category-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          <p className="admin-page-subtitle">{subtitle}</p>
        </div>
      </div>
      <div className="admin-panel category-create-panel">
      <CreateBox CreateMethod={CreateMethod} data={data || []} runAsync={runAsync} />
      </div>
      <div className="admin-panel category-tree-panel">
      <Tree treeData={tree}></Tree>
      </div>
    </div>
  );
};

export default Category;
