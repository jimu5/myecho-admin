import React, { lazy } from 'react';

import RequireAuth from './RequireAuth';

const Login = lazy(() => import(/* webpackPrefetch:true */ '@/pages/Login'));
const Main = lazy(() => import(/* webpackPrefetch:true */ '@/components/Main'));

const routerMap = [
  {
    path: '*',
    element: (
      <RequireAuth>
        <Main />
      </RequireAuth>
    ),
  },
  { path: '/login', name: 'Login', element: <Login /> },
];

export default routerMap;
