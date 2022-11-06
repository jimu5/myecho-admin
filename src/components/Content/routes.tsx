import React, { lazy } from 'react';

const elements = {
  article: {
    write: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/Write')),
    all: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/All')),
    tag: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/Tag')),
    category: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/Category')),
  },
  link: {
    all: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Link/ALL')),
  },
  setting: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Setting')),
};

const contentRoutes = [
  {
    path: '',
    element: <h1> / </h1>,
  },
  {
    path: 'article',
    children: [
      {
        path: 'write',
        element: <elements.article.write />,
        children: [
          { path: ':id', element: <elements.article.write /> },
        ],
      },
      {
        path: 'all',
        element: <elements.article.all />,
      },
      {
        path: 'tag',
        element: <elements.article.tag />,
      },
      {
        path: 'category',
        element: <elements.article.category />,
      }
    ],
  },
  {
    path: 'link',
    children: [
      {
        path: 'all',
        element: <elements.link.all />,
      },
    ]
  },
  {
    path: 'setting',
    element: <elements.setting />,
  }
];

export default contentRoutes;
