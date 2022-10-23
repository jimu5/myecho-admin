import React from "react";
import { message, Popconfirm, Space, Table, Button } from "antd";
import { ColumnsType } from "antd/lib/table";
import { useRequest, useSafeState } from "ahooks";

import { SettingApi, settingModel } from "@/utils/apis/setting";

import ModalCreate from "./modalCreate";

const Setting: React.FC = () => {

  const [dataSource, setDataSource] = useSafeState<settingModel[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);

  const columns: ColumnsType<settingModel> = [
    {
      title: '设置 key',
      dataIndex: 'key',
      width: 140,
      key: 'key'
    },
    {
      title: '设置 type',
      dataIndex: 'type',
      width: 100,
      key: 'type'
    },
    {
      title: '设置值',
      dataIndex: 'value',
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
              SettingApi.delete(data.key).then(() => {
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
    () => SettingApi.getAll().then((data: any) => {
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

export default Setting;