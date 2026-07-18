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
      title: '描述',
      dataIndex: 'description',
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
              SettingApi.delete(data.key).then(() => {
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
    () => SettingApi.getAll().then((data: any) => {
      setDataSource(data)
    })
  )
  return (
    <div className="admin-table-page setting-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">站点设置</h1>
          <p className="admin-page-subtitle">管理站点标题、SEO、系统配置和运行参数。</p>
        </div>
      </div>
      <div className="admin-toolbar">
      <Button
        onClick={() => setOpenModalCreate(true)}
      >创建设置</Button>
      </div>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <div className="admin-table-card">
      <EditableProTable
        rowKey="id"
        columns={columns}
        value={dataSource || []}
        onChange={(values) => setDataSource(values as settingModel[])}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (_rowKey, data) => {
            await SettingApi.updateValue(data.key, data.value, data.description);
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

export default Setting;
