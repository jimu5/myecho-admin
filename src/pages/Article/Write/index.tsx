import React, { useCallback } from 'react';
import moment from 'moment';
import Vditor from 'vditor';
import { useParams } from 'react-router-dom';
import { useLocalStorageState, useRequest, useSafeState } from 'ahooks';
import {
  Layout,
  Card,
  Select,
  DatePicker,
  notification,
  Switch,
  TreeSelect,
} from 'antd';
import {
  KeyOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  TagsOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import 'vditor/dist/index.css';

import { article, articleRequest, ArticleApi } from '@/utils/apis/article';
import { tag, TagApi } from '@/utils/apis/tag';
import { category, CategoryApi } from '@/utils/apis/category';
import { formatDateTime } from '@/utils/datetime';

import ArticleLocalCache from '../articleEditCache';
import s from './index.module.scss';
import './index.scss';

const { Content, Sider } = Layout;
const { Option } = Select;

var article_info: article; // 不安全的做法

const ArticleWrite: React.FC = () => {
  const { id } = useParams();
  const article_id = id ? parseInt(id) : undefined;
  const { runAsync, loading } = useRequest(
    () =>
      article_id
        ? ArticleApi.get(article_id).then((data) => {
            setArticleDetail(data as any);
            article_info = data as any;
          })
        : Promise.resolve(),
    { manual: true }
  );
  const [, setEmpty] = useSafeState(false); // TODO: 临时用来刷新组件的，需要和上面的article_info一起改
  const [vditor, setVd] = React.useState<Vditor>();
  const [tagData, setTagData] = useSafeState<tag[]>([]);
  const [categoryTree, setCategoryTree] = useSafeState([]);
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: {},
    });
  const [articleDetail, setArticleDetail] = useSafeState<article>(article_info);

  const getEditArticle = () => {
    if (articleDetail) {
      return articleDetail;
    }
    return articleEditCache;
  };

  const setEditArticle = (values: any) => {
    if (articleDetail) {
      setArticleDetail({ ...articleDetail, ...values });
      // TODO: 先使用 article_info
      article_info = { ...article_info, ...values };
      return;
    }
    setArticleEditCache({ ...articleEditCache, ...values });
  };

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (article_id) {
        // 如果有文章id的话就填充文章
        runAsync().then(() => {
          vditor.setValue(article_info?.detail.content || '');
          setVd(vditor);
        });
      }
    },
    [article_id, runAsync]
  );

  const buildTree = useCallback(
    (data: any) => {
      const tree: any = [];
      data.forEach((item: category) => {
        if (item.father_id === 0 || item.father_id === null) {
          tree.push({
            title: item.name,
            key: item.id,
            value: item.id,
            children: [],
          });
        } else {
          const parent = tree.find((i: any) => i.key === item.father_id);
          if (parent) {
            parent.children!.push({
              title: item.name,
              key: item.id,
              value: item.id,
              children: [],
            });
          }
        }
      });
      setCategoryTree(tree);
    },
    [setCategoryTree]
  );

  React.useEffect(() => {
    const useCache = Boolean(!article_id);
    const vditor = new Vditor('vditor', {
      height: window.innerHeight / 2,
      after: () => {
        fillArticle(vditor);
        setVd(vditor);
      },
      cache: { enable: useCache },
    });
    TagApi.getList().then((data) => {
      setTagData(data);
    });
    CategoryApi.getList().then((data) => {
      buildTree(data);
    });
  }, [fillArticle, article_id, setTagData, buildTree]);

  const saveArticle = () => {
    let data: articleRequest = {
      content: vditor?.getValue(),
    };
    // TODO: 这块逻辑后面要改下
    if (article_id) {
      let tag_ids = articleDetail.tags?.map((item) => item.id) || [];
      data = { ...data, ...article_info, tag_ids };
      ArticleApi.patch(article_id, data).then(() => {
        notification.success({ message: '更新成功' });
      });
    } else {
      let tag_ids = articleEditCache.tags?.map((item) => item.id) || [];
      data = { ...data, ...articleEditCache, tag_ids };
      ArticleApi.create(data).then(() => {
        notification.success({ message: '保存成功' });
        setArticleEditCache({} as article);
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
                  setArticleEditCache({ ...articleEditCache, status: 3 });
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
                    [2, 5].includes(
                      article_info?.status || articleEditCache.status!
                    )
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
            {/* tag标签 */}
            <div className={s.tagDiv}>
              <TagsOutlined />
              <span>标签: </span>
              <Select
                loading={loading}
                showSearch
                allowClear
                mode="multiple"
                style={{ width: '100%' }}
                value={Array.from(getEditArticle().tags || [], (tag) =>
                  String(tag.id)
                )}
                onChange={(value) => {
                  let tags: tag[] = [];
                  value.forEach((TagID) => {
                    tags.push({ id: Number(TagID), name: '' } as tag);
                  });
                  setEditArticle({ tags });
                }}>
                {tagData.map((d) => (
                  <Option key={d.id}>{d.name}</Option>
                ))}
              </Select>
            </div>
            <div className={s.categoryDiv}>
              <FolderOutlined />
              <span>分类: </span>
              <br />
              <TreeSelect
                value={getEditArticle()?.category_id || null}
                treeData={categoryTree}
                style={{ width: '100%' }}
                onChange={(value) => {
                  setEditArticle({ category_id: value });
                }}></TreeSelect>
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
