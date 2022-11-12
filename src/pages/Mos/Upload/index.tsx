import React from "react"
import { Upload } from "antd"
import { InboxOutlined } from "@ant-design/icons"

import { MosAPI } from "@/utils/apis/mos"
import { user } from "@/utils/myaxios"

const { Dragger } = Upload

const UploadFile: React.FC = () => {
  return (
    <div>
      <Dragger
        action="/mos/files/upload"
        headers={{ 'Authorization': `token ${user.token}` }}
        multiple={true}
        onRemove={(file)=> {
          MosAPI.delete(file.response.id)
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">脱拽到此区域来上传</p>
        <p className="ant-upload-hint">
          支持单文件或者多文件上传
        </p>
      </Dragger>
    </div>
  )
}

export default UploadFile
