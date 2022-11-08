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
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(data.id)
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              LinkAPI.delete(data.id).then(() => {
                message.success("删除成功");
                runAsync();
              })
            }}
          >
            <a>删除</a>
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
    <div>
      <Button
        onClick={() => setOpenModalCreate(true)}
      >创建新的</Button>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <EditableProTable
        rowKey="id"
        columns={columns}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            LinkAPI.put(data.id, data).then(
              message.success("保存成功")
            )
          },
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel]
        }}
        recordCreatorProps={false}
        pagination={false}
        loading={loading}
        style={{
          paddingTop: "20px"
        }}
      ></EditableProTable>
    </div>
  );
}

export default LinkALL;