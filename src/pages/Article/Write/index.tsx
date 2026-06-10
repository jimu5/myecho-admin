import React, { useCallback, useEffect } from 'react';
import moment from 'moment';
import Vditor from 'vditor';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorageState, useRequest, useSafeState } from 'ahooks';
import {
  Layout,
  Card,
  Select,
  DatePicker,
  notification,
  Switch,
  TreeSelect,
  Button,
  Modal,
  Input,
  List,
  Image,
  Space,
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
import { MosAPI, File } from '@/utils/apis/mos';
import { isAssetTypeAnImage } from '@/utils/image_tool';

import ArticleLocalCache from '../articleEditCache';
import s from './index.module.scss';
import './index.scss';

const { Content, Sider } = Layout;
const { Option } = Select;

const getFileExtension = (file: File) => {
  if (file.extension_name) {
    return file.extension_name;
  }
  const fileName = file.full_name || file.url || '';
  const normalizedName = fileName.split('?')[0];
  return normalizedName.includes('.') ? normalizedName.split('.').pop() || '' : '';
};

const isMediaImage = (file: File) => isAssetTypeAnImage(getFileExtension(file));

const ArticleWrite: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const article_id = id ? parseInt(id) : undefined;
  const { runAsync, loading } = useRequest(
    () =>
      article_id
        ? ArticleApi.get_no_read(article_id).then((data) => {
          const articleData = data as any;
          setArticleDetail(articleData);
          return articleData;
        })
        : Promise.resolve(),
    { manual: true }
  );
  const [vditor, setVd] = React.useState<Vditor>();
  const [tagData, setTagData] = useSafeState<tag[]>([]);
  const [categoryTree, setCategoryTree] = useSafeState([]);
  const [dirty, setDirty] = useSafeState(false);
  const [autoSavedAt, setAutoSavedAt] = useSafeState<string>();
  const [previewOpen, setPreviewOpen] = useSafeState(false);
  const [mediaOpen, setMediaOpen] = useSafeState(false);
  const [mediaKeyword, setMediaKeyword] = useSafeState('');
  const [mediaFiles, setMediaFiles] = useSafeState<File[]>([]);
  const [mediaLoading, setMediaLoading] = useSafeState(false);
  const [mediaTotal, setMediaTotal] = useSafeState(0);
  const [mediaPage, setMediaPage] = useSafeState({ current: 1, pageSize: 20 });
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: { status: 1, visibility: 1 },
    });
  const [articleDetail, setArticleDetail] = useSafeState<article | undefined>();

  const getEditArticle = () => {
    if (articleDetail) {
      return articleDetail;
    }
    return articleEditCache;
  };

  const setEditArticle = (values: any) => {
    if (articleDetail) {
      setArticleDetail({ ...articleDetail, ...values });
      return;
    };
    setArticleEditCache({ ...articleEditCache, ...values });
  };

  const fillArticle = useCallback(
    (vditor: Vditor) => {
      if (article_id) {
        // 如果有文章id的话就填充文章
        runAsync().then((data) => {
          vditor.setValue(data?.detail?.content || '');
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

  const saveArticle = useCallback((override: Partial<articleRequest> = {}) => {
    let data: articleRequest = {
      content: vditor?.getValue(),
      ...override,
    };
    if (article_id) {
      let tag_uids = articleDetail?.tags?.map((item) => item.uid) || [];
      data = { ...data, ...articleDetail, tag_uids, ...override };
      ArticleApi.patch(article_id, data).then(() => {
        notification.success({ message: '更新成功' });
        setDirty(false);
        navigate('/admin/article/all');
      })
    } else {
      let tag_uids = articleEditCache.tags?.map((item) => item.uid) || [];
      data = { ...data, ...articleEditCache, tag_uids, ...override };
      ArticleApi.create(data).then(() => {
        notification.success({ message: '保存成功' });
        localStorage.removeItem("articleEditCache");
        vditor?.setValue('');
        setDirty(false);
        navigate('/admin/article/all');
      })
    }
  }, [articleDetail, articleEditCache, article_id, navigate, setDirty, vditor])

  const loadMediaFiles = useCallback((name = '', current = 1, pageSize = 20) => {
    setMediaLoading(true);
    MosAPI.getList(current, pageSize, name).then((data: any) => {
      setMediaFiles(data.data || []);
      setMediaTotal(data.total || 0);
      setMediaPage({ current, pageSize });
    }).finally(() => setMediaLoading(false));
  }, [setMediaFiles, setMediaLoading, setMediaPage, setMediaTotal]);

  const openMediaLibrary = () => {
    setMediaOpen(true);
    loadMediaFiles(mediaKeyword, 1, mediaPage.pageSize);
  };

  const insertMedia = (file: File) => {
    const markdown = isMediaImage(file)
      ? `![${file.full_name}](${file.url})`
      : `[${file.full_name}](${file.url})`;
    (vditor as any)?.insertValue?.(markdown);
    setDirty(true);
    setMediaOpen(false);
  };

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
      input: () => {
        setDirty(true);
        setAutoSavedAt(moment().format('HH:mm:ss'));
      },
    });
    TagApi.getList().then((data) => {
      setTagData(data);
    });
    CategoryApi.getArticleList().then((data) => {
      buildTree(data);
    });
    return () => {
      vditor.destroy();
    };
  }, [fillArticle, article_id, setAutoSavedAt, setDirty, setTagData, buildTree]);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) {
        return;
      }
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  return (
    <Layout>
      <Content className={s.content}>
        <h1>{article_id ? '编辑文章' : '撰写新文章'}</h1>
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          value={
            articleDetail ? articleDetail.title : articleEditCache.title
          }
          onChange={(event) => {
            setEditArticle({ title: event.target.value });
          }}></input>
        <div id="vditor" className="vditor" />
        <Space style={{ marginTop: 12 }}>
          <Button onClick={() => setPreviewOpen(true)}>预览</Button>
          <Button onClick={openMediaLibrary}>媒体库</Button>
          <span className={s.autoSaveText}>
            {autoSavedAt ? `已自动保存 ${autoSavedAt}` : '等待编辑'}
            {dirty ? ' · 有未发布改动' : ''}
          </span>
        </Space>
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
                  saveArticle({ status: 4 });
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
                    articleDetail ? articleDetail.status : articleEditCache.status
                  }
                  onChange={(value) => {
                    setEditArticle({ status: value });
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
                    articleDetail?.post_time || articleEditCache.post_time
                  )}
                  onChange={(_, dateString) => {
                    setEditArticle({ post_time: dateString });
                  }}
                />
              </div>
            </div>
            <div className={s.bottomPostDiv}>
              <CommentOutlined />
              <span>是否允许评论</span>
              <Switch
                checked={Boolean(
                  articleDetail
                    ? articleDetail.is_allow_comment
                    : articleEditCache?.is_allow_comment
                )}
                onChange={(checked) => {
                  setEditArticle({ is_allow_comment: checked });
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
              <button className={s.postSubmit} onClick={() => saveArticle()}>
                立即发布
              </button>
            </div>
          </Card>
        </div>
      </Sider>
      <Modal
        title="文章预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={860}>
        <div
          className={s.previewBody}
          dangerouslySetInnerHTML={{ __html: (vditor as any)?.getHTML?.() || vditor?.getValue() || '' }}
        />
      </Modal>
      <Modal
        title="媒体库"
        open={mediaOpen}
        onCancel={() => setMediaOpen(false)}
        footer={null}
        width={760}>
        <Input.Search
          allowClear
          placeholder="搜索文件名"
          style={{ marginBottom: 12 }}
          value={mediaKeyword}
          onChange={(event) => setMediaKeyword(event.target.value)}
          onSearch={(value) => {
            setMediaKeyword(value);
            loadMediaFiles(value, 1, mediaPage.pageSize);
          }}
        />
        <List
          loading={mediaLoading}
          dataSource={mediaFiles}
          grid={{ gutter: 12, xs: 1, sm: 2, md: 3 }}
          pagination={{
            total: mediaTotal,
            current: mediaPage.current,
            pageSize: mediaPage.pageSize,
            showSizeChanger: true,
            onChange: (current, pageSize) => loadMediaFiles(mediaKeyword, current, pageSize),
          }}
          renderItem={(file) => (
            <List.Item>
              <button className={s.mediaItem} type="button" onClick={() => insertMedia(file)}>
                {isMediaImage(file) ? (
                  <Image src={file.url} preview={false} />
                ) : (
                  <span className={s.filePreview}>{file.extension_name || 'file'}</span>
                )}
                <span>{file.full_name}</span>
              </button>
            </List.Item>
          )}
        />
      </Modal>
    </Layout>
  );
};

export default ArticleWrite;
