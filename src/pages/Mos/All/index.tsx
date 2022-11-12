import React from "react";
import dayjs from "dayjs";
import { usePagination, useSafeState } from 'ahooks';
import type { ProColumns } from "@ant-design/pro-components";
import { message, Space, Popconfirm, Image, Button } from "antd";
import { PaperClipOutlined } from "@ant-design/icons"
import { EditableProTable } from "@ant-design/pro-table";

import { MosAPI, File } from "@/utils/apis/mos";
import { isAssetTypeAnImage } from "@/utils/image_tool";

const FileAll: React.FC = () => {
  async function getFileList(params: {
    current: number;
    pageSize: number;
    name: string
  }): Promise<{ total: number; list: File[] }> {
    return MosAPI.getList(
      params.current,
      params.pageSize,
      params.name
    ).then((data: any) => {
      return { total: data.total, list: data.data };
    });
  }
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const { data, loading, pagination, refresh } = usePagination(getFileList);

  const columns: ProColumns<File>[] = [
    {
      title: '文件名',
      dataIndex: 'full_name',
      ellipsis: {
        showTitle: false,
      },
      render: (_, record) => <span>{record.full_name}</span>
    },
    {
      title: '链接',
      dataIndex: 'link',
      readonly: true,
      width: 130,
      render: (_, record) =>
        <Space>
          <a href={record.url} target="_blank" rel="noreferrer">打开</a>
          <Button
            size="small"
            onClick={() => {
              navigator.clipboard.writeText(`${document.location.protocol}//${document.location.hostname}:${document.location.port}${record.url}`);
              message.success("复制成功")
            }}
          >复制链接</Button>
        </Space>
    },
    {
      title: '预览',
      dataIndex: 'url',
      readonly: true,
      width: 200,
      render: (_, record) => <span>{isAssetTypeAnImage(record.extension_name) ?
        <Image src={record.url}></Image> :
        <a href={record.url}><PaperClipOutlined />{record.full_name}</a>}</span>
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 105,
      readonly: true,
      render: (_, record) => <>{dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss')}</>
    },
    {
      title: '备注',
      dataIndex: 'note',
      render: (text) => <span>{text}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 110,
      valueType: 'option',
      render: (text, record, _, action) => (
        <Space size="middle">

          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(record.id)
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确认删除?"
            onConfirm={() => {
              MosAPI.delete(record.id).then(() => {
                message.success('删除成功');
                refresh();
              });
            }}
            okText="确认"
            cancelText="取消">
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
      fixed: "right"
    },
  ];
  return (
    <div>

      <EditableProTable
        columns={columns}
        rowKey={(data) => data.id}
        value={data?.list}
        loading={loading}
        recordCreatorProps={false}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            MosAPI.Update(data).then(
              () => {
                message.success("保存成功");
                refresh()
              }
            )
          },
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel]
        }}
        pagination={{
          total: data?.total,
          pageSize: pagination.pageSize,
          current: pagination.current,
          onChange: pagination.onChange,
        }}
        scroll={{ x: 'max-content' }}
      >
      </EditableProTable>
    </div>
  )
}

export default FileAll;