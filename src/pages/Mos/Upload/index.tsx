import React from "react"
import { Upload } from "antd"
import { InboxOutlined } from "@ant-design/icons"

import { MosAPI } from "@/utils/apis/mos"
import { getAuthHeaders } from "@/utils/myaxios"

const { Dragger } = Upload

const UploadFile: React.FC = () => {
  return (
    <div className="admin-page upload-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">上传文件</h1>
          <p className="admin-page-subtitle">上传图片、附件和文章可引用的媒体资源。</p>
        </div>
      </div>
      <div className="admin-panel upload-panel">
      <Dragger
        action="/mos/files/upload"
        headers={getAuthHeaders()}
        multiple={true}
        onRemove={(file)=> {
          MosAPI.delete(file.response.id)
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">拖拽到此区域来上传</p>
        <p className="ant-upload-hint">
          支持单文件或者多文件上传
        </p>
      </Dragger>
      </div>
    </div>
  )
}

export default UploadFile
