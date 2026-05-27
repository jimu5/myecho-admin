import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import type { themeModel } from '@/utils/apis/theme';

interface ModalPreviewProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  theme: themeModel | null;
}

const ModalPreview: React.FC<ModalPreviewProps> = ({ open, setOpen, theme }) => {
  const [previewHtml, setPreviewHtml] = useState<string>('');

  useEffect(() => {
    if (open && theme) {
      // 生成预览HTML内容
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${theme.display_name} - 预览</title>
          ${theme.css ? `<style>${theme.css}</style>` : ''}
        </head>
        <body>
          <div class="preview-container">
            <header>
              <h1>${theme.display_name}</h1>
              <p>作者：${theme.author} | 版本：${theme.version}</p>
            </header>
            <main>
              <section class="preview-content">
                <h2>主题预览示例</h2>
                <p>这是一个示例文章内容，用于预览主题的样式效果。</p>
                <div class="demo-post">
                  <h3>示例文章标题</h3>
                  <p>这是一段示例文章内容，展示主题中正文的样式效果。包括字体、颜色、行高、间距等排版属性。</p>
                  <p>更多的示例文本，用于观察主题在不同内容长度下的表现。</p>
                </div>
                <div class="demo-comments">
                  <h3>评论区示例</h3>
                  <div class="demo-comment">
                    <p><strong>用户1</strong>: 这是一条示例评论。</p>
                  </div>
                  <div class="demo-comment">
                    <p><strong>用户2</strong>: 这是另一条示例评论，用于展示评论区的样式。</p>
                  </div>
                </div>
              </section>
            </main>
            <footer>
              <p>主题预览 - ${new Date().toLocaleDateString()}</p>
            </footer>
          </div>
          ${theme.js ? `<script>${theme.js}</script>` : ''}
        </body>
        </html>
      `;
      setPreviewHtml(html);
    }
  }, [open, theme]);

  const handleCancel = () => {
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
        {previewHtml && (
          <iframe
            srcDoc={previewHtml}
            style={{ width: '100%', height: '100%', border: 'none' }}
            title={`${theme.display_name} 预览`}
          />
        )}
      </div>
    </Modal>
  );
};

export default ModalPreview;
