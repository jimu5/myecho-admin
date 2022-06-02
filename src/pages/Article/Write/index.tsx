import React, { useCallback } from 'react';
import moment from 'moment';
import Vditor from 'vditor';
import { useParams } from 'react-router-dom';
import { useLocalStorageState, useRequest, useSafeState } from 'ahooks';
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

var article_info: article | undefined;  // 不安全的做法

const ArticleWrite: React.FC = () => {
  const { id } = useParams();
  const article_id = id ? parseInt(id) : undefined;
  const { runAsync } = useRequest(
    () =>
      article_id
        ? ArticleApi.get(article_id).then((data) => {
            article_info = data as any;
          })
        : Promise.resolve(),
    { manual: true }
  );
  const [, setEmpty] = useSafeState(false);  // TODO: 临时用来刷新组件的，需要和上面的article_info一起改
  const [vditor, setVd] = React.useState<Vditor>();
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: {},
    });

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (!article_id) {
        return;
      }
      // 如果有文章id的话就填充文章
      runAsync().then(() => {
        vditor.setValue(article_info?.detail.content || '');
        setVd(vditor);
      });
    },
    [article_id, runAsync]
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
      content: vditor?.getValue(),
    };
    if (article_id) {
      data = { ...data, ...article_info };
      ArticleApi.patch(article_id, data).then(() => {
        notification.success({ message: '更新成功' });
      });
    } else {
      data = { ...data, ...articleEditCache };
      ArticleApi.create(data).then(() => {
        notification.success({ message: '保存成功' });
        setArticleEditCache({});
        vditor?.setValue('');
      });
    }
  };

  const isStatusVisible = () => {
    let checkVar = article_info || articleEditCache;
    let visible = checkVar?.status
      ? [2, 5].includes(checkVar.status)
        ? 'none'
        : 'block'
      : 'block';
    console.log(visible);
    return visible;
  };

  return (
    <Layout>
      <Content className={s.content}>
        <h1>撰写新文章</h1>
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          defaultValue={
            article_info ? article_info?.title : articleEditCache.title
          }
          onChange={(event) => {
            if (!article_info) {
              setArticleEditCache({
                ...articleEditCache,
                title: event.target.value,
              });
            } else {
              article_info.title = event.target.value;
            }
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
                  display: [2, 5].includes(
                    article_info?.status || articleEditCache.status!
                  )
                    ? 'none'
                    : 'block',
                }}>
                <KeyOutlined />
                <span>状态：</span>
                <Select
                  style={{ width: '60%' }}
                  defaultValue={
                    article_info
                      ? article_info?.status
                      : articleEditCache.status || 1
                  }
                  onChange={(value) => {
                    if (!article_info) {
                      setArticleEditCache({
                        ...articleEditCache,
                        status: value,
                      });
                    } else {
                      article_info.status = value;
                      setEmpty(true);
                    }
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
                  defaultValue={
                    // 状态如果为 发布 草稿 等待复审，显示为公开
                    [2, 5].includes(article_info?.status || articleEditCache.status!)
                      ? article_info?.status || articleEditCache.status
                      : 1
                  }
                  onChange={(value) => {
                    if (!article_info) {
                      setArticleEditCache({
                        ...articleEditCache,
                        status: value,
                      });
                    } else {
                      article_info.status = value;
                      setEmpty(true);
                    }
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
                  defaultValue={moment(
                    article_info?.post_time || articleEditCache.post_time
                  )}
                  onChange={(_, dateString) => {
                    if (!article_info) {
                      setArticleEditCache({
                        ...articleEditCache,
                        post_time: formatDateTime(dateString),
                      });
                    } else {
                      article_info.post_time = formatDateTime(dateString);
                    }
                  }}
                />
              </div>
            </div>
            <div className={s.bottomPostDiv}>
              <CommentOutlined />
              <span>是否允许评论</span>
              <Switch
                defaultChecked={
                  article_info
                    ? article_info.is_allow_comment
                    : articleEditCache?.is_allow_comment
                }
                onChange={(checked) => {
                  if (!article_info) {
                    setArticleEditCache({
                      ...articleEditCache,
                      is_allow_comment: checked,
                    });
                  } else {
                    article_info.is_allow_comment = checked;
                  }
                }}
              />
            </div>
            <div className={s.bottomPostDiv}>
              <button className={s.postSubmit} onClick={saveArticle}>
                立即发布
              </button>
            </div>
          </Card>
        </div>
      </Sider>
    </Layout>
  );
};

export default ArticleWrite;
