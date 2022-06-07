import React, { lazy } from 'react';

const elements = {
  article: {
    write: lazy(
      () => import(/* webpackPrefetch:true */ '@/pages/Article/Write')
    ),
    all: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/All')),
    tag: lazy(() => import(/* webpackPrefetch:true */ '@/pages/Article/Tag')),
  },
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
      }
    ],
  },
];

export default contentRoutes;
