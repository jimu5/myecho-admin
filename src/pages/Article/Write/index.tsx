import React, { useCallback } from 'react';
import Vditor from 'vditor';
import { useLocalStorageState } from 'ahooks';
import { Layout, Card } from 'antd';
import 'vditor/dist/index.css';

import { article } from '@/utils/apis/article';

import ArticleLocalCache from '../articleEditCache';
import s from './index.module.scss';
import './index.scss';

const { Content, Sider } = Layout;

interface Props {
  article?: article;
}

const ArticleWrite: React.FC<Props> = ({ article }) => {
  const [, setVd] = React.useState<Vditor>();
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache');

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (!article) {
        return;
      }
      setArticleEditCache({ title: article?.title });
      vditor.setValue(article?.detail.content);
      setVd(vditor);
    },
    [article, setArticleEditCache]
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
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          value={articleEditCache?.title}
          onChange={(event) => {
            setArticleEditCache({ title: event.target.value });
          }}></input>
        <div id="vditor" className="vditor" />
      </Content>
      <Sider
        className={s.sider}
        breakpoint="lg"
        collapsedWidth="0"
        theme="light">
        <div className={s.submitDiv}>
          <Card
            title={
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                发布
              </p>
            }
            headStyle={{
              padding: '1px 4px',
              minHeight: '36px',
            }}
            bodyStyle={{
              padding: '0px',
            }}>
            <div className={s.topPostDiv}>
              <button className={s.savePost}>保存草稿</button>
            </div>
            <div className={s.postSettingDiv}>
              <p className={s.postSettingSection}>
                状态设置
              </p>
              <p className={s.postSettingSection}>
                可见性设置
              </p>
              <p className={s.postSettingSection}>
                发布时间
              </p>
            </div>
            <div className={s.bottomPostDiv}>
              <button className={s.postSubmit}>立即发布</button>
            </div>
          </Card>
        </div>
      </Sider>
    </Layout>
  );
};

export default ArticleWrite;
