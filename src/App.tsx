import React from 'react';
import { connect } from 'react-redux';
import { Layout } from 'antd';

import Sider from '@/components/Sider';
import Header from '@/components/Header';
import Main from '@/components/Main';
import Footer from '@/components/Footer';

import './App.css';

const App: React.FC = () => {
  return (
    <div>
      <Sider />
      <Layout style={{ marginLeft: 200 }}>
        <Header />
        <Main />
        <Footer />
      </Layout>
    </div>
  );
};

export default connect()(App);
