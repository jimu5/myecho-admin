import React, { useCallback, useEffect } from 'react';
import dayjs from 'dayjs';
import Vditor from 'vditor';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalStorageState, useSafeState } from 'ahooks';
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
  CodeOutlined,
  CommentOutlined,
  TagsOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import 'vditor/dist/index.css';

import {
  article,
  articleRequest,
  articleRevision,
  ArticleApi,
  articleStatus,
  articlePublishStatus,
  articleTypes,
  articleContentFormats,
  isScheduledArticle,
} from '@/utils/apis/article';
import { tag, TagApi } from '@/utils/apis/tag';
import { category, CategoryApi } from '@/utils/apis/category';
import { vditorUploadOptions } from '@/utils/vditorConfg';
import { myLocale } from '@/utils/config';
import { MosAPI, File } from '@/utils/apis/mos';
import { isAssetTypeAnImage } from '@/utils/image_tool';
import { useAdminTheme } from '@/themeContext';

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

const getErrorMessage = (error: any) =>
  error?.response?.data?.msg || error?.msg || error?.message || '请稍后重试';

const ArticleWrite: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useAdminTheme();
  const { id } = useParams();
  const article_id = id ? parseInt(id) : undefined;
  const [vditor, setVd] = React.useState<Vditor>();
  const [tagData, setTagData] = useSafeState<tag[]>([]);
  const [categoryTree, setCategoryTree] = useSafeState([]);
  const [dirty, setDirty] = useSafeState(false);
  const [lastEditedAt, setLastEditedAt] = useSafeState<string>();
  const [articleLoading, setArticleLoading] = useSafeState(Boolean(article_id));
  const [articleLoadError, setArticleLoadError] = useSafeState('');
  const [saving, setSaving] = useSafeState(false);
  const savingRef = React.useRef(false);
  const [previewOpen, setPreviewOpen] = useSafeState(false);
  const [mediaOpen, setMediaOpen] = useSafeState(false);
  const [mediaKeyword, setMediaKeyword] = useSafeState('');
  const [mediaFiles, setMediaFiles] = useSafeState<File[]>([]);
  const [mediaLoading, setMediaLoading] = useSafeState(false);
  const [mediaTotal, setMediaTotal] = useSafeState(0);
  const [mediaPage, setMediaPage] = useSafeState({ current: 1, pageSize: 20 });
  const [revisionOpen, setRevisionOpen] = useSafeState(false);
  const [revisions, setRevisions] = useSafeState<articleRevision[]>([]);
  const [revisionsLoading, setRevisionsLoading] = useSafeState(false);
  const [articleEditCache, setArticleEditCache] =
    useLocalStorageState<ArticleLocalCache>('articleEditCache', {
      defaultValue: { status: 1, visibility: 1, type: 1, content_format: 'markdown' },
    });
  const [articleDetail, setArticleDetail] = useSafeState<article | undefined>();

  const getEditArticle = () => {
    if (articleDetail) {
      return articleDetail;
    }
    return articleEditCache;
  };

  const getContentFormat = () => getEditArticle()?.content_format || 'markdown';

  const getEditorContent = () => vditor?.getValue() || '';

  const getPreviewHTML = () => {
    if (getContentFormat() === 'html') {
      return getEditorContent();
    }
    return (vditor as any)?.getHTML?.() || getEditorContent();
  };

  const getPreviewDocument = () => `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 20px; color: ${theme === 'dark' ? '#ecf3ef' : '#17212b'}; background: ${theme === 'dark' ? '#18211c' : '#fff'}; font: 16px/1.8 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow-wrap: anywhere; }
    img, video { max-width: 100%; height: auto; }
    pre { max-width: 100%; overflow: auto; padding: 12px; border-radius: 8px; background: ${theme === 'dark' ? '#202b25' : '#f5f7f1'}; }
    table { max-width: 100%; border-collapse: collapse; }
  </style>
</head>
<body>${getPreviewHTML()}</body>
</html>`;

  const markEdited = () => {
    setDirty(true);
    setLastEditedAt(dayjs().format('HH:mm:ss'));
  };

  const setEditArticle = (values: any) => {
    markEdited();
    if (articleDetail) {
      setArticleDetail({ ...articleDetail, ...values });
      return;
    };
    setArticleEditCache({ ...articleEditCache, ...values });
  };

  const loadArticle = useCallback(async (editor: Vditor) => {
    if (!article_id) {
      return;
    }
    setArticleLoading(true);
    setArticleLoadError('');
    setArticleDetail(undefined);
    try {
      const data = await ArticleApi.get_no_read(article_id) as any;
      setArticleDetail(data);
      editor.setValue(data?.detail?.content || '');
    } catch (error) {
      setArticleLoadError(getErrorMessage(error));
    } finally {
      setArticleLoading(false);
    }
  }, [article_id, setArticleDetail, setArticleLoadError, setArticleLoading]);

  const fillArticle = useCallback((editor: Vditor) => {
    if (article_id) {
      void loadArticle(editor);
    }
  }, [article_id, loadArticle]);

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

  const saveArticle = useCallback(async (override: Partial<articleRequest> = {}) => {
    if (savingRef.current) {
      return;
    }
    if (article_id && (!articleDetail || articleLoading || articleLoadError)) {
      notification.error({ message: '文章尚未加载完成，请重试' });
      return;
    }
    let data: articleRequest = {
      content: getEditorContent(),
      content_format: getContentFormat(),
      ...override,
    };
    savingRef.current = true;
    setSaving(true);
    try {
      if (article_id) {
        const tag_uids = articleDetail?.tags?.map((item) => item.uid) || [];
        data = { ...data, ...articleDetail, tag_uids, ...override };
        await ArticleApi.patch(article_id, data);
        notification.success({ message: '更新成功' });
        setDirty(false);
        navigate('/admin/article/all');
      } else {
        const tag_uids = articleEditCache.tags?.map((item) => item.uid) || [];
        data = { ...data, ...articleEditCache, tag_uids, ...override };
        await ArticleApi.create(data);
        notification.success({ message: '保存成功' });
        localStorage.removeItem("articleEditCache");
        vditor?.setValue('');
        setDirty(false);
        navigate('/admin/article/all');
      }
    } catch (error) {
      notification.error({
        message: article_id ? '更新失败' : '保存失败',
        description: getErrorMessage(error),
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [articleDetail, articleEditCache, article_id, articleLoadError, articleLoading, navigate, setDirty, setSaving, vditor])

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
    const imageAlt = file.note?.trim() || file.full_name;
    const markdown = isMediaImage(file)
      ? `![${imageAlt}](${file.url})`
      : `[${file.full_name}](${file.url})`;
    (vditor as any)?.insertValue?.(markdown);
    markEdited();
    setMediaOpen(false);
  };

  const loadRevisions = useCallback(async () => {
    if (!article_id) {
      return;
    }
    setRevisionsLoading(true);
    try {
      setRevisions(await ArticleApi.revisions(article_id));
    } catch (error) {
      notification.error({ message: '版本历史加载失败', description: getErrorMessage(error) });
    } finally {
      setRevisionsLoading(false);
    }
  }, [article_id, setRevisions, setRevisionsLoading]);

  const openRevisionHistory = () => {
    setRevisionOpen(true);
    void loadRevisions();
  };

  const restoreRevision = (revision: articleRevision) => {
    if (!article_id) {
      return;
    }
    Modal.confirm({
      title: '恢复这个版本？',
      content: `${dayjs(revision.created_at).format('YYYY-MM-DD HH:mm')} · ${revision.title}`,
      okText: '恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          const restored = await ArticleApi.restoreRevision(article_id, revision.id);
          setArticleDetail(restored);
          vditor?.setValue(restored?.detail?.content || '');
          setDirty(false);
          notification.success({ message: '版本已恢复' });
          await loadRevisions();
        } catch (error) {
          notification.error({ message: '恢复失败', description: getErrorMessage(error) });
        }
      },
    });
  };

  useEffect(() => {
    const useCache = Boolean(!article_id);
    const vditor = new Vditor('vditor', {
      height: Math.max(520, window.innerHeight - 280),
      after: () => {
        setVd(vditor);
        fillArticle(vditor);
      },
      cache: { enable: useCache },
      upload: vditorUploadOptions,
      input: () => {
        markEdited();
      },
    });
    const editorElement = document.getElementById('vditor');
    const visualViewport = window.visualViewport;
    const syncEditorViewport = () => {
      editorElement?.style.setProperty(
        '--editor-viewport-height',
        `${visualViewport?.height || window.innerHeight}px`,
      );
    };
    syncEditorViewport();
    window.addEventListener('resize', syncEditorViewport);
    visualViewport?.addEventListener('resize', syncEditorViewport);
    TagApi.getList().then((data) => {
      setTagData(data);
    });
    CategoryApi.getArticleList().then((data) => {
      buildTree(data);
    });
    return () => {
      window.removeEventListener('resize', syncEditorViewport);
      visualViewport?.removeEventListener('resize', syncEditorViewport);
      vditor.destroy();
    };
  }, [fillArticle, article_id, setTagData, buildTree]);

  useEffect(() => {
    vditor?.setTheme(
      theme === 'dark' ? 'dark' : 'classic',
      theme === 'dark' ? 'dark' : 'light',
    );
  }, [theme, vditor]);

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

  const currentStatus = getEditArticle()?.status || 1;
  const scheduled = isScheduledArticle(getEditArticle());
  const legacyStatus = !articlePublishStatus.has(currentStatus);

  return (
    <div className="admin-write-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{article_id ? '编辑文章' : '撰写新文章'}</h1>
          <p className="admin-page-subtitle">沉浸写作，保存草稿，预览内容，并从媒体库插入素材。</p>
        </div>
      </div>
      {article_id && articleLoading && (
        <div className={s.articleLoadState} role="status">正在加载文章详情...</div>
      )}
      {article_id && articleLoadError && (
        <div className={s.articleLoadError} role="alert">
          <span>文章加载失败：{articleLoadError}</span>
          <Button disabled={!vditor || articleLoading} onClick={() => vditor && void loadArticle(vditor)}>
            重试
          </Button>
        </div>
      )}
      <div className={s.primaryActions}>
        <button
          className={s.savePost}
          disabled={saving || Boolean(article_id && (!articleDetail || articleLoading || articleLoadError))}
          aria-busy={saving}
          onClick={() => {
            void saveArticle({ status: 4 });
          }}>
          {saving ? '保存中...' : '保存草稿'}
        </button>
        <button
          className={s.postSubmit}
          disabled={saving || Boolean(article_id && (!articleDetail || articleLoading || articleLoadError))}
          aria-busy={saving}
          onClick={() => void saveArticle({ status: currentStatus === 2 ? 2 : 1 })}>
          {saving ? '保存中...' : scheduled ? '定时发布' : '立即发布'}
        </button>
      </div>
    <Layout className={s.writeLayout}>
      <Content className={s.content}>
        <input
          placeholder="添加标题"
          className={s.articleTitle}
          value={
            articleDetail ? articleDetail.title : articleEditCache.title
          }
          onChange={(event) => {
            setEditArticle({ title: event.target.value });
          }}></input>
        <input
          placeholder="自定义链接 slug"
          className={s.articleSlug}
          value={getEditArticle()?.slug || ''}
          onChange={(event) => {
            setEditArticle({ slug: event.target.value });
          }}
        />
        <section className={s.summarySection} aria-labelledby="article-summary-label">
          <div className={s.summaryHeading}>
            <label id="article-summary-label" htmlFor="article-summary">文章摘要</label>
            <span>用于列表与分享预览</span>
          </div>
          <Input.TextArea
            id="article-summary"
            placeholder="用于文章列表和分享预览，留空则自动从正文生成"
            value={getEditArticle()?.summary || ''}
            maxLength={255}
            showCount
            autoSize={{ minRows: 3, maxRows: 5 }}
            onChange={(event) => setEditArticle({ summary: event.target.value })}
          />
          <div className={s.summaryPreview} aria-label="列表和分享摘要预览">
            <span>列表 / 分享摘要预览</span>
            <strong>{getEditArticle()?.title?.trim() || '文章标题预览'}</strong>
            <p>{getEditArticle()?.summary?.trim() || '留空后将自动从正文提取摘要。'}</p>
          </div>
        </section>
        <section className={s.summarySection} aria-labelledby="article-seo-label">
          <div className={s.summaryHeading}>
            <label id="article-seo-label">搜索与分享</label>
            <span>留空时使用文章标题、摘要与站点分享图</span>
          </div>
          <Input
            aria-label="SEO 标题"
            placeholder="SEO 标题"
            maxLength={160}
            value={(getEditArticle() as any)?.seo_title || ''}
            onChange={(event) => setEditArticle({ seo_title: event.target.value })}
          />
          <Input.TextArea
            aria-label="SEO 描述"
            placeholder="SEO 描述"
            maxLength={255}
            showCount
            autoSize={{ minRows: 2, maxRows: 4 }}
            value={(getEditArticle() as any)?.seo_description || ''}
            onChange={(event) => setEditArticle({ seo_description: event.target.value })}
          />
          <Input
            aria-label="分享图地址"
            placeholder="分享图地址，例如 /storage/share.jpg"
            maxLength={512}
            value={(getEditArticle() as any)?.share_image || ''}
            onChange={(event) => setEditArticle({ share_image: event.target.value })}
          />
        </section>
        <div id="vditor" className="vditor" />
        <Space wrap style={{ marginTop: 12 }}>
          <Button onClick={() => setPreviewOpen(true)}>预览</Button>
          <Button onClick={openMediaLibrary}>媒体库</Button>
          {article_id && <Button onClick={openRevisionHistory}>版本历史</Button>}
          <span className={s.autoSaveText}>
            {lastEditedAt ? `最近编辑 ${lastEditedAt}` : '等待编辑'}
            {dirty ? ' · 有未发布改动' : ''}
          </span>
        </Space>
      </Content>
      <Sider
        className={s.sider}
        theme={theme}>
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
                  {Array.from(articlePublishStatus).map(item => (
                    <Option value={item[0]} key={item[0]}>{item[1]}</Option>
                  ))}
                  {legacyStatus && (
                    <Option value={currentStatus} disabled>{articleStatus.get(currentStatus)}（旧状态）</Option>
                  )}
                </Select>
              </div>
              <div
                className={s.postSettingSection}
              >
                <KeyOutlined />
                <span>类型：</span>
                <Select
                  aria-label="内容类型"
                  style={{ width: '60%' }}
                  value={getEditArticle()?.type || 1}
                  onChange={(value) => {
                    setEditArticle({ type: value });
                  }}>
                  {Array.from(articleTypes).map(item => (
                    <Option value={item[0]} key={item[0]}>{item[1]}</Option>
                  ))}
                </Select>
              </div>
              <div
                className={s.postSettingSection}
              >
                <CodeOutlined />
                <span>格式：</span>
                <Select
                  aria-label="内容格式"
                  style={{ width: '60%' }}
                  value={getContentFormat()}
                  onChange={(value) => {
                    setEditArticle({ content_format: value });
                  }}>
                  {Array.from(articleContentFormats).map(item => (
                    <Option value={item[0]} key={item[0]}>{item[1]}</Option>
                  ))}
                </Select>
              </div>
              <div className={s.postSettingSection}>
                <ClockCircleOutlined />
                <span>{scheduled ? '定时发布时间' : '发布时间'}</span>
                <DatePicker
                  showTime
                  format="YYYY-MM-DDTHH:mm:ssZ"
                  locale={myLocale.DatePicker}
                  value={getEditArticle()?.post_time ? dayjs(getEditArticle()?.post_time) : null}
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
            <div className={s.passwordDiv}>
              <KeyOutlined />
              <span>访问密码: </span>
              <input
                placeholder="访问密码"
                type="password"
                value={(getEditArticle() as any)?.password || ''}
                onChange={(event) => {
                  setEditArticle({ password: event.target.value, clear_password: false });
                }}
              />
              {(getEditArticle() as any)?.is_password_protected && (
                <button
                  type="button"
                  className={s.clearPassword}
                  onClick={() => setEditArticle({ password: '', clear_password: true })}
                >
                  清除密码
                </button>
              )}
            </div>
            {/* tag标签 */}
            <div className={s.tagDiv}>
              <TagsOutlined />
              <span>标签: </span>
              <Select
                loading={articleLoading}
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
          </Card>
        </div>
      </Sider>
      <Modal
        title="版本历史"
        open={revisionOpen}
        onCancel={() => setRevisionOpen(false)}
        footer={null}
        width={680}>
        <List
          loading={revisionsLoading}
          dataSource={revisions}
          locale={{ emptyText: '暂无历史版本；下次保存时会保留当前版本。' }}
          renderItem={(revision) => (
            <List.Item actions={[
              <Button type="link" onClick={() => restoreRevision(revision)}>恢复</Button>,
            ]}>
              <List.Item.Meta
                title={revision.title || '未命名版本'}
                description={`${dayjs(revision.created_at).format('YYYY-MM-DD HH:mm')} · /${revision.slug}`}
              />
            </List.Item>
          )}
        />
      </Modal>
      <Modal
        title="文章预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={860}>
        <iframe
          title="文章预览内容"
          className={s.previewFrame}
          sandbox=""
          srcDoc={getPreviewDocument()}
        />
      </Modal>
      <Modal
        title="媒体库"
        className="admin-media-modal"
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
    </div>
  );
};

export default ArticleWrite;
