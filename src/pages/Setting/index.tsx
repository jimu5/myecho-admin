import React from "react";
import { message, Popconfirm, Space, Button } from "antd";
import { EditableProTable } from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-components";
import { useRequest, useSafeState } from "ahooks";

import { SettingApi, settingModel } from "@/utils/apis/setting";

import ModalCreate from "./modalCreate";

const Setting: React.FC = () => {

  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<settingModel[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);

  const columns: ProColumns<settingModel>[] = [
    {
      title: '设置 key',
      dataIndex: 'key',
      width: 140,
      fieldProps: (form, {entity, }) => {
        if (entity.is_system) {
          return {
            disabled: true,
          }
        }
      }
    },
    {
      title: '设置 type',
      dataIndex: 'type',
      width: 100,
      readonly: true
    },
    {
      title: '设置值',
      dataIndex: 'value',
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
              SettingApi.updateValue(data.key, data.value).then(
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

export default Setting;