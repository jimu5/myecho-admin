import React from 'react';
import { ControlOutlined, PushpinOutlined } from '@ant-design/icons';

const menuConfig = [
  {
    key: '1',
    icon: <ControlOutlined />,
    label: '仪表盘',
  },
  {
    key: '2',
    icon: <PushpinOutlined />,
    label: '文章',
    children: [
      {
        key: '2-1',
        label: '所有文章',
      },
      {
        key: '2-2',
        label: '写文章',
      },
      {
        key: '2-3',
        label: '分类',
      },
      {
        key: '2-4',
        label: '标签',
      },
    ],
  },
];

export default menuConfig;