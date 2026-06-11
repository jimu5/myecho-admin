import React, { Suspense } from 'react';
import { Content } from 'antd/lib/layout/layout';
import { useRoutes } from 'react-router-dom';

import routes from './routes';

const MyContent: React.FC = () => {
  return (
      <Content className="admin-content">
        <div className="admin-content-inner">
        <Suspense fallback={<div className="admin-loading">正在加载内容...</div>}>
          {useRoutes(routes)}
        </Suspense>
        </div>
      </Content>
  );
};

export default MyContent;
