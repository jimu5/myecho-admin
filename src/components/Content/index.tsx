import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Content } from 'antd/lib/layout/layout';

const MyContent: React.FC = () => {
  return (
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <h1>Content</h1>
        <Routes>
          <Route path="/" element={<h1> / </h1>}/>
          <Route path="test" element={<h1> test</h1>}/>
        </Routes>
      </Content>
  );
};

export default MyContent;
