import React, { lazy } from "react";

const Login = lazy(() => import(/* webpackPrefetch:true */ '@/pages/Login'));
const Main = lazy(() => import(/* webpackPrefetch:true */ '@/components/Main'));

const routerMap =  [
    { path: '*', element: <Main /> },
    { path: '/login', name: 'Login', element: <Login /> },
]

export default routerMap;
