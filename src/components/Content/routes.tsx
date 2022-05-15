import React, { lazy } from 'react';

const elements = {
  article: {
    write: lazy(
      () => import(/* webpackPrefetch:true */ '@/pages/Article/Write')
    ),
  },
};

const contentRoutes = [
  {
    path: '/',
    element: <h1> / </h1>,
  },
  {
    path: '/article',
    children: [
      {
        path: 'write',
        element: <elements.article.write />,
      },
    ],
  },
];

export default contentRoutes;
