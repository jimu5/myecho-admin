import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';

import { store } from './redux/store';
import { myLocale } from './utils/config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <ConfigProvider locale={myLocale}>
        <App />
      </ConfigProvider>
    </BrowserRouter>
  </Provider>
);
