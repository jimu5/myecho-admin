import React, { useCallback, useEffect } from 'react';
import moment from 'moment';
import Vditor from 'vditor';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorageState, useRequest, useSafeState, useUpdate } from 'ahooks';
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
  ClockCircleOutlined,
  CommentOutlined,
  TagsOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import 'vditor/dist/index.css';

import { article, articleRequest, ArticleApi, articleStatus } from '@/utils/apis/article';
import { tag, TagApi } from '@/utils/apis/tag';
import { category, CategoryApi } from '@/utils/apis/category';
import { vditorUploadOptions } from '@/utils/vditorConfg';
import { myLocale } from '@/utils/config';

import ArticleLocalCache from '../articleEditCache';
import s from './index.module.scss';
import './index.scss';

const { Content, Sider } = Layout;
const { Option } = Select;

var article_info: article; // 不安全的做法

const ArticleWrite: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const article_id = id ? parseInt(id) : undefined;
  const { runAsync, loading } = useRequest(
    () =>
      article_id
        ? ArticleApi.get_no_read(article_id).then((data) => {
          setArticleDetail(data as any);
          article_info = data as any;
        })
        : Promise.resolve(),
    { manual: true }
  );
  const update = useUpdate();
  const [saveArticleAlias, SetSaveArticleAlias] = useSafeState(false);
  const [vditor, setVd] = React.useState<Vditor>();
  const [tagData, setTagData] = useSafeState<tag[]>([]);
  const [categoryTree, setCategoryTree] = useSafeState([]);
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: { status: 1, visibility: 1 },
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
    };
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
      } else {
        article_info = null as any;
      }
    },
    [article_id, runAsync]
  );

  const buildTree = useCallback(
    (data: any) => {
      const tree: any = [];
      data.forEach((item: category) => {
        if (item.father_uid === "" || item.father_uid === null) {
          tree.push({
            title: item.name,
            key: item.uid,
            value: item.uid,
            children: [],
          });
        } else {
          const parent = tree.find((i: any) => i.key === item.father_uid);
          if (parent) {
            parent.children!.push({
              title: item.name,
              key: item.uid,
              value: item.uid,
              children: [],
            });
          }
        }
      });
      setCategoryTree(tree);
    },
    [setCategoryTree]
  );

  const saveArticle = useCallback(() => {
    let data: articleRequest = {
      content: vditor?.getValue(),
    };
    // TODO: 这块逻辑后面要改下
    if (article_id) {
      let tag_uids = articleDetail.tags?.map((item) => item.uid) || [];
      data = { ...data, ...article_info, tag_uids };
      ArticleApi.patch(article_id, data).then(() => {
        notification.success({ message: '更新成功' });
        navigate('/admin/article/all');
      })
    } else {
      let tag_uids = articleEditCache.tags?.map((item) => item.uid) || [];
      data = { ...data, ...articleEditCache, tag_uids };
      ArticleApi.create(data).then(() => {
        notification.success({ message: '保存成功' });
        localStorage.removeItem("articleEditCache");
        vditor?.setValue('');
        navigate('/admin/article/all');
      })
    }
  }, [articleDetail?.tags, articleEditCache, article_id, navigate, vditor])

  useEffect(() => {
    const useCache = Boolean(!article_id);
    const vditor = new Vditor('vditor', {
      height: window.innerHeight / 2,
      after: () => {
        fillArticle(vditor);
        setVd(vditor);
      },
      cache: { enable: useCache },
      upload: vditorUploadOptions,
    });
    TagApi.getList().then((data) => {
      setTagData(data);
    });
    CategoryApi.getArticleList().then((data) => {
      buildTree(data);
    });
  }, [fillArticle, article_id, setTagData, buildTree]);

  useEffect(() => {
    if (saveArticleAlias) {
      saveArticle()
    }
  }, [articleEditCache, saveArticleAlias, saveArticle])

  return (
    <Layout>
      <Content className={s.content}>
        <h1>{article_info ? '编辑文章' : '撰写新文章'}</h1>
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          value={
            article_info ? article_info.title : articleEditCache.title
          }
          onChange={(event) => {
            if (!article_info) {
              setArticleEditCache({
                ...articleEditCache,
                title: event.target.value,
              });
            } else {
              article_info.title = event.target.value;
              update();
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
                  setEditArticle({ status: 4 });
                  SetSaveArticleAlias(true);
                }}>
                保存草稿
              </button>
            </div>
            <div className={s.postSettingDiv}>
              <div
                className={s.postSettingSection}
              >
                <KeyOutlined />
                <span>状态：</span>
                <Select
                  style={{ width: '60%' }}
                  value={
                    article_info ? article_info.status : articleEditCache.status
                  }
                  onChange={(value) => {
                    if (!article_info) {
                      setArticleEditCache({
                        ...articleEditCache,
                        status: value,
                      });
                    } else {
                      article_info.status = value;
                      update();
                    }
                  }}>
                  {Array.from(articleStatus).map(item => (
                    <Option value={item[0]} key={item[0]}>{item[1]}</Option>
                  ))}
                </Select>
              </div>
              <div className={s.postSettingSection}>
                <ClockCircleOutlined />
                <span>发布时间</span>
                <DatePicker
                  showTime
                  format="YYYY-MM-DDTHH:mm:ssZ"
                  locale={myLocale.DatePicker}
                  value={moment(
                    article_info?.post_time || articleEditCache.post_time
                  )}
                  onChange={(_, dateString) => {
                    if (!article_info) {
                      setArticleEditCache({
                        ...articleEditCache,
                        post_time: dateString,
                      });
                    } else {
                      article_info.post_time = dateString;
                      update();
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
                  String(tag.uid)
                )}
                onChange={(value) => {
                  let tags: tag[] = [];
                  value.forEach((TagID) => {
                    tags.push({ uid: TagID, name: '' } as tag);
                  });
                  setEditArticle({ tags });
                }}>
                {tagData.map((d) => (
                  <Option key={d.uid}>{d.name}</Option>
                ))}
              </Select>
            </div>
            <div className={s.categoryDiv}>
              <FolderOutlined />
              <span>分类: </span>
              <br />
              <TreeSelect
                value={getEditArticle()?.category_uid || null}
                treeData={categoryTree}
                style={{ width: '100%' }}
                onChange={(value) => {
                  setEditArticle({ category_uid: value });
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
