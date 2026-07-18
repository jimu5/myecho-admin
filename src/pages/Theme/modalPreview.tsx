import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Input, message, Modal, Segmented, Spin } from 'antd';
import { getThemeErrorMessage, ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

interface ModalPreviewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: themeModel | null;
}

type PreviewViewport = 'desktop' | 'tablet' | 'mobile';

const previewWidths: Record<PreviewViewport, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '390px',
};

const ModalPreview: React.FC<ModalPreviewProps> = ({ open, setOpen, theme }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [previewPath, setPreviewPath] = useState('/');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [frameLoading, setFrameLoading] = useState(false);
  const [viewport, setViewport] = useState<PreviewViewport>('desktop');
  const requestVersion = useRef(0);

  const loadPreview = useCallback(async (value: string) => {
    if (!theme) return;
    const path = normalizePreviewPath(value);
    const version = ++requestVersion.current;
    setPreviewPath(path);
    setPreviewUrl('');
    setTokenLoading(true);
    setFrameLoading(false);
    try {
      const data: any = await ThemeApi.previewToken(theme.id, path);
      if (version === requestVersion.current) {
        setPreviewUrl(data.preview_url);
        setFrameLoading(true);
      }
    } catch (error) {
      if (version === requestVersion.current) {
        message.error('主题预览链接生成失败：' + getThemeErrorMessage(error));
        setPreviewUrl('');
        setFrameLoading(false);
      }
    } finally {
      if (version === requestVersion.current) {
        setTokenLoading(false);
      }
    }
  }, [theme]);

  useEffect(() => {
    if (open && theme) {
      loadPreview('/');
    } else {
      requestVersion.current += 1;
      setPreviewUrl('');
      setTokenLoading(false);
      setFrameLoading(false);
    }
  }, [open, theme, loadPreview]);

  useEffect(() => () => {
    requestVersion.current += 1;
    ThemeApi.clearPreview().catch(() => undefined);
  }, []);

  const handleCancel = () => {
    requestVersion.current += 1;
    setPreviewUrl('');
    setTokenLoading(false);
    setFrameLoading(false);
    ThemeApi.clearPreview().catch(() => undefined);
    setOpen(false);
  };

  if (!theme) return null;

  return (
    <Modal
      title={`${theme?.display_name} 预览`}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={960}
      className="theme-preview-modal"
    >
      <div className="theme-preview-toolbar">
        <Input.Search
          aria-label="预览页面路径"
          value={previewPath}
          onChange={(event) => setPreviewPath(event.target.value)}
          onSearch={loadPreview}
          enterButton="加载页面"
          loading={tokenLoading}
          className="theme-preview-path"
        />
        <Segmented
          className="theme-preview-device-control"
          aria-label="预览设备尺寸"
          value={viewport}
          options={[
            { label: '桌面', value: 'desktop' },
            { label: '平板', value: 'tablet' },
            { label: '手机', value: 'mobile' },
          ]}
          onChange={(value) => setViewport(value as PreviewViewport)}
        />
      </div>
      <div className="theme-preview-frame">
        <div className="theme-preview-viewport" style={{ maxWidth: previewWidths[viewport] }}>
          <Spin spinning={tokenLoading || frameLoading} style={{ width: '100%' }}>
            {!previewUrl && !tokenLoading && (
              <div className="theme-preview-empty">输入站内路径后加载主题预览。</div>
            )}
            {previewUrl && (
              <iframe
                src={previewUrl}
                className="theme-preview-iframe"
                title={`${theme.display_name} 预览`}
                onLoad={() => setFrameLoading(false)}
              />
            )}
          </Spin>
        </div>
      </div>
    </Modal>
  );
};

function normalizePreviewPath(value: string) {
  const path = value.trim();
  if (!path.startsWith('/') || path.startsWith('//')) {
    return '/';
  }
  return path;
}

export default ModalPreview;
