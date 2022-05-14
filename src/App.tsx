import React from 'react';
import { connect } from 'react-redux';
import { useRoutes } from 'react-router-dom';

import routerMap from './routerMap';
import './App.css';

const App: React.FC = () => {
  const elements = useRoutes(routerMap);
  return elements
};

export default connect()(App);
