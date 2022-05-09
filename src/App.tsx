import React from 'react';
import { connect } from 'react-redux';

import Main from '@/components/Main';

import './App.css';

const App: React.FC = () => {
  return (
    <div>
      <Main />
    </div>
  );
};

export default connect()(App);
