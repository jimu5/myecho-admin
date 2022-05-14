import React from 'react';
import { Layout } from 'antd';

import Sider from '@/components/Sider';
import Header from '@/components/Header';
import Content from '@/components/Content';
import Footer from '@/components/Footer';

const Main: React.FC = () => {
  return (
    <main>
      <Sider />
      <Layout style={{ marginLeft: 200 }}>
        <Header />
        <Content />
        <Footer />
      </Layout>
    </main>
  );
};

export default Main;
