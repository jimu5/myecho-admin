import React, { lazy } from 'react';

import RequireAuth from './RequireAuth';

const Login = lazy(() => import(/* webpackPrefetch:true */ '@/pages/Login'));
const Setup = lazy(() => import(/* webpackPrefetch:true */ '@/pages/Setup'));
const Main = lazy(() => import(/* webpackPrefetch:true */ '@/components/Main'));

const routerMap = [
  {
    path: 'admin/*',
    element: (
      <RequireAuth>
        <Main />
      </RequireAuth>
    ),
  },
  { path: 'admin/login', name: 'Login', element: <Login /> },
  { path: 'admin/setup', name: 'Setup', element: <Setup /> },
];

export default routerMap;
