import React, { useCallback } from 'react';
import Vditor from 'vditor';
import { Layout } from 'antd';
import 'vditor/dist/index.css';

import { article } from '@/utils/apis/article';

import s from './index.module.scss';

const { Content, Sider } = Layout;

interface Props {
  article?: article;
}

const ArticleWrite: React.FC<Props> = ({ article }) => {
  const [, setVd] = React.useState<Vditor>();

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (!article) {
        return;
      }
      vditor.setValue(article?.detail.content);
      setVd(vditor);
    },
    [article]
  );

  React.useEffect(() => {
    const vditor = new Vditor('vditor', {
      height: window.innerHeight / 2,
      after: () => {
        fillArticle(vditor);
        setVd(vditor);
      },
    });
  }, [fillArticle]);

  return (
    <Layout>
      <Content className={s.content}>
        <h1>撰写新文章</h1>
        <input placeholder="添加标题" className={s.articleTitle}>
          {article && article.title}
        </input>
        <div id="vditor" className="vditor" />
      </Content>
      <Sider
        className={s.sider}
        breakpoint="lg"
        collapsedWidth="0"
        theme="light">
        <div className={s.submitDiv}>
          <p>这里放文章的一些设置项目</p>
        </div>
      </Sider>
    </Layout>
  );
};

export default ArticleWrite;
