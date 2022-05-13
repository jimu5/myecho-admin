import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';

const Main: React.FC = () => {
  return (
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <h1>Content</h1>
        <Routes>
          <Route path="/" />
        </Routes>
      </Content>
  );
};

export default Main;
