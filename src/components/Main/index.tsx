import React from 'react';
import { Layout } from 'antd';

import Sider from '@/components/Sider';
import Header from '@/components/Header';
import Content from '@/components/Content';
import Footer from '@/components/Footer';

const Main: React.FC = () => {
  return (
    <main>
      <Layout>
        <Sider />
        <Layout>
          <Header />
          <Content />
          <Footer />
        </Layout>
      </Layout>
    </main>
  );
};

export default Main;
