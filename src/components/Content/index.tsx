import React from 'react';
import { Content } from 'antd/lib/layout/layout';
import { useRoutes } from 'react-router-dom';

import routes from './routes';

const MyContent: React.FC = () => {
  return (
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        {useRoutes(routes)}
      </Content>
  );
};

export default MyContent;
