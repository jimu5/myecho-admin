import React from "react";
import { message, Popconfirm, Space, Button } from "antd";
import { EditableProTable } from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-components";
import { useRequest, useSafeState } from "ahooks";

import { LinkAPI, Link } from "@/utils/apis/link";

import ModalCreate from "./modalCreate";

const LinkALL: React.FC = () => {

  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<Link[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);

  const columns: ProColumns<Link>[] = [
    {
      title: '链接名称',
      dataIndex: 'name',
      width: 140,
    },
    {
      title: '链接描述',
      dataIndex: 'description',
      width: 100,
    },
    {
      title: '链接地址',
      dataIndex: 'url',
    },
    {
      title: '链接图像地址',
      dataIndex: 'icon_url',
    },
    {
      title: '操作',
      key: 'actions',
      valueType: 'option',
      render: (text, data, _, action) => (
        <Space size={"middle"}>
          <Button
            key="editable"
            type="link"
            onClick={() => {
              action?.startEditable?.(data.id)
            }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              LinkAPI.delete(data.id).then(() => {
                message.success("删除成功");
                runAsync();
              })
            }}
          >
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const { runAsync, loading } = useRequest(
    () => LinkAPI.getAll().then((data: any) => {
      setDataSource(data)
    })
  )

  return (
    <div className="admin-table-page link-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">友链管理</h1>
          <p className="admin-page-subtitle">维护站点展示的外部链接、描述和封面图片。</p>
        </div>
      </div>
      <div className="admin-toolbar">
      <Button
        onClick={() => setOpenModalCreate(true)}
      >创建链接</Button>
      </div>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <div className="admin-table-card">
      <EditableProTable
        rowKey="id"
        columns={columns}
        value={dataSource || []}
      onChange={(values) => setDataSource(values as Link[])}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_rowKey, data) => {
            await LinkAPI.put(data.id, data);
            message.success("保存成功");
            await runAsync();
          },
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel]
        }}
        recordCreatorProps={false}
        pagination={false}
        loading={loading}
        scroll={{ x: 'max-content' }}
      ></EditableProTable>
      </div>
    </div>
  );
}

export default LinkALL;
