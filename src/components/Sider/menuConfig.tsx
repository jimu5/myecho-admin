import React from 'react';
import { ControlOutlined, PushpinOutlined, SettingOutlined } from '@ant-design/icons';

const menuConfig = [
  {
    key: '/',
    icon: <ControlOutlined />,
    label: '仪表盘',
  },
  {
    key: 'article',
    icon: <PushpinOutlined />,
    label: '文章',
    children: [
      {
        key: 'article/all',
        label: '所有文章',
      },
      {
        key: 'article/write',
        label: '写文章',
      },
      {
        key: 'article/category',
        label: '分类',
      },
      {
        key: 'article/tag',
        label: '标签',
      },
    ],
  },
  {
    key: 'setting',
    icon: <SettingOutlined />,
    label: '站点设置'
  }
];

export default menuConfig;