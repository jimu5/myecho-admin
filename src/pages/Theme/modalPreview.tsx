import React, { useEffect, useState } from 'react';
import { message, Modal, Spin } from 'antd';
import { ThemeApi } from '@/utils/apis/theme';
import type { themeModel } from '@/utils/apis/theme';

interface ModalPreviewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: themeModel | null;
}

const ModalPreview: React.FC<ModalPreviewProps> = ({ open, setOpen, theme }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && theme) {
      setLoading(true);
      ThemeApi.previewToken(theme.id, '/')
        .then((data: any) => setPreviewUrl(data.preview_url))
        .catch((error) => {
          message.error('主题预览链接生成失败：' + error.message);
          setPreviewUrl('');
        })
        .finally(() => setLoading(false));
    } else {
      setPreviewUrl('');
    }
  }, [open, theme]);

  const handleCancel = () => {
    setPreviewUrl('');
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
      width={800}
    >
      <div style={{ height: '500px', overflow: 'auto' }}>
        <Spin spinning={loading} style={{ width: '100%' }}>
          {previewUrl && (
          <iframe
            src={previewUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${theme.display_name} 预览`}
          />
          )}
        </Spin>
      </div>
    </Modal>
  );
};

export default ModalPreview;
