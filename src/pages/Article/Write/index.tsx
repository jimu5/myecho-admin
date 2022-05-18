import React, { useCallback } from 'react';
import moment from 'moment';
import Vditor from 'vditor';
import { useLocalStorageState } from 'ahooks';
import { Layout, Card, Select, DatePicker, notification, Switch } from 'antd';
import {
  KeyOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import 'vditor/dist/index.css';

import { article, articleRequest, ArticleApi } from '@/utils/apis/article';
import { formatDateTime } from '@/utils/datetime';

import ArticleLocalCache from '../articleEditCache';
import s from './index.module.scss';
import './index.scss';

const { Content, Sider } = Layout;
const { Option } = Select;

interface Props {
  article?: article;
}

const ArticleWrite: React.FC<Props> = ({ article }) => {
  const [vditor, setVd] = React.useState<Vditor>();
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: {},
    });

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (!article) {
        return;
      }
      // 将 localStorage 中的数据填充到vditor中
      setArticleEditCache({ ...article });
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

  const saveArticle = () => {
    let data: articleRequest = {
      ...articleEditCache,
      content: vditor?.getValue(),
    };
    if (article?.id) {
      ArticleApi.patch(article.id, data).then(() => {
        notification.success({ message: '更新成功' });
      });
    } else {
      ArticleApi.create(data).then(() => {
        notification.success({ message: '保存成功' });
        setArticleEditCache({});
        vditor?.setValue('');
      });
    }
  };

  return (
    <Layout>
      <Content className={s.content}>
        <h1>撰写新文章</h1>
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          value={articleEditCache?.title || ''}
          onChange={(event) => {
            setArticleEditCache({
              ...articleEditCache,
              title: event.target.value,
            });
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
              <button
                className={s.savePost}
                onClick={() => {
                  setArticleEditCache({ status: 3 });
                  saveArticle();
                }}>
                保存草稿
              </button>
            </div>
            <div className={s.postSettingDiv}>
              <div
                className={s.postSettingSection}
                style={{
                  display: articleEditCache?.status
                    ? [2, 5].includes(articleEditCache.status)
                      ? 'none'
                      : 'block'
                    : 'block',
                }}>
                <KeyOutlined />
                <span>状态：</span>
                <Select
                  style={{ width: '60%' }}
                  value={articleEditCache?.status || 1}
                  onChange={(value) => {
                    setArticleEditCache({ ...articleEditCache, status: value });
                  }}>
                  <Option value={1}>发布</Option>
                  <Option value={3}>草稿</Option>
                  <Option value={4}>等待复审</Option>
                </Select>
              </div>
              <div className={s.postSettingSection}>
                <EyeOutlined />
                <span>可见性：</span>
                <Select
                  style={{ width: '60%' }}
                  value={
                    // 状态如果为 发布 草稿 等待复审，显示为公开
                    articleEditCache?.status
                      ? [2, 5].includes(articleEditCache.status)
                        ? articleEditCache?.status
                        : 1
                      : 1
                  }
                  onChange={(value) => {
                    setArticleEditCache({ ...articleEditCache, status: value });
                  }}>
                  <Option value={1}>公开</Option>
                  <Option value={2}>置顶</Option>
                  <Option value={5}>私密</Option>
                </Select>
              </div>
              <div className={s.postSettingSection}>
                <ClockCircleOutlined />
                <span>发布时间</span>
                <DatePicker
                  showTime
                  defaultValue={
                    articleEditCache?.post_time
                      ? moment(articleEditCache?.post_time)
                      : undefined
                  }
                  onChange={(_, dateString) => {
                    console.log(moment().format('YYYY-MM-DDTHH:mm:ss[Z]'));
                    setArticleEditCache({
                      ...articleEditCache,
                      post_time: formatDateTime(dateString),
                    });
                  }}
                />
              </div>
            </div>
            <div className={s.bottomPostDiv}>
              <CommentOutlined />
              <span>是否允许评论</span>
              <Switch
                onChange={(checked) => {
                  if (articleEditCache)
                    articleEditCache.is_allow_comment = checked;
                }}
              />
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
