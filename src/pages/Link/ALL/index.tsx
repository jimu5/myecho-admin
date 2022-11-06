import React from "react";
import { message, Popconfirm, Space, Table, Button } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useRequest, useSafeState } from "ahooks";

import { LinkAPI, Link } from "@/utils/apis/link";

import ModalCreate from "./modalCreate";

const LinkALL: React.FC = () => {

  const [dataSource, setDataSource] = useSafeState<Link[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);

  const columns: ColumnsType<Link> = [
    {
      title: '链接名称',
      dataIndex: 'name',
      width: 140,
      key: 'key'
    },
    {
      title: '链接描述',
      dataIndex: 'description',
      width: 100,
      key: 'type'
    },
    {
      title: '链接地址',
      dataIndex: 'url',
      key: 'value'
    },
    {
      title: '链接图像地址',
      dataIndex: 'icon_url',
      key: 'value'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, data) => (
        <Space size={"middle"}>
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
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync}/>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        loading={loading}
        style={{
          paddingTop: "20px"
        }}
      ></Table>
    </div>
  );
}

export default LinkALL;