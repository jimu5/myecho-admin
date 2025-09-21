import React from 'react';
import { message, Popconfirm, Space, Button } from 'antd';
import { EditableProTable } from '@ant-design/pro-table';
import type { ProColumns } from '@ant-design/pro-components';
import { useRequest, useSafeState } from 'ahooks';

import { ThemeApi, themeModel } from '@/utils/apis/theme';

import ModalCreate from './modalCreate';
import ModalConfig from './modalConfig';
import ModalPreview from './modalPreview';

const Theme: React.FC = () => {
  const [editableKeys, setEditableKeys] = useSafeState<React.Key[]>([]);
  const [dataSource, setDataSource] = useSafeState<themeModel[]>();
  const [openModalCreate, setOpenModalCreate] = useSafeState(false);
  const [openModalConfig, setOpenModalConfig] = useSafeState(false);
  const [openModalPreview, setOpenModalPreview] = useSafeState(false);
  const [currentTheme, setCurrentTheme] = useSafeState<themeModel | null>(null);

  const columns: ProColumns<themeModel>[] = [
    {
      title: '主题名称',
      dataIndex: 'name',
      width: 140,
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '作者',
      dataIndex: 'author',
      width: 120,
    },
    {
      title: '版本',
      dataIndex: 'version',
      width: 80,
    },
    {
      title: '描述',
      dataIndex: 'description',
      fieldProps: (form, { entity }) => {
        if (entity.is_default) {
          return {
            disabled: true,
          };
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      valueType: 'switch',
      width: 100,
      render: (dom: React.ReactNode, record) => {
        return record.is_active ? '已激活' : '未激活';
      },
      fieldProps: (form, { entity }) => {
        return {
          disabled: entity.is_default,
          checked: entity.is_active,
          onChange: (checked: boolean) => {
            if (checked) {
              ThemeApi.activate(entity.id).then(() => {
                message.success('主题激活成功');
                runAsync();
              }).catch((err) => {
                message.error('主题激活失败：' + err.message);
              });
            }
          },
        };
      },
    },
    {
      title: '操作',
      key: 'actions',
      valueType: 'option',
      render: (text, data, _, action) => (
        <Space size={'middle'}>
          <a
            key="config"
            onClick={() => {
              setCurrentTheme(data);
              setOpenModalConfig(true);
            }}
          >
            配置
          </a>
          <a
            key="preview"
            onClick={() => {
              setCurrentTheme(data);
              setOpenModalPreview(true);
            }}
          >
            预览
          </a>
          <a
            key="editable"
            onClick={() => {
              action?.startEditable?.(data.id);
            }}
            style={{ display: data.is_default ? 'none' : 'inline' }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定删除?"
            onConfirm={() => {
              ThemeApi.delete(data.id).then(() => {
                message.success('删除成功');
                runAsync();
              }).catch((err) => {
                message.error('删除失败：' + err.message);
              });
            }}
            disabled={data.is_default || data.is_active}
          >
            <a style={{ display: data.is_default || data.is_active ? 'none' : 'inline' }}>
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const { runAsync, loading } = useRequest(
    () => ThemeApi.getAll().then((data: any) => {
      setDataSource(data);
    })
  );

  return (
    <div>
      <Button
        onClick={() => setOpenModalCreate(true)}
      >创建新主题</Button>
      <ModalCreate open={openModalCreate} setOpen={setOpenModalCreate} okCallBack={runAsync} />
      <ModalConfig 
        open={openModalConfig} 
        setOpen={setOpenModalConfig} 
        theme={currentTheme} 
        okCallBack={runAsync} 
      />
      <ModalPreview 
        open={openModalPreview} 
        setOpen={setOpenModalPreview} 
        theme={currentTheme} 
      />
      <EditableProTable
        rowKey="id"
        columns={columns}
        value={dataSource || []}
        onChange={(values) => setDataSource(values as themeModel[])}
        editable={{
          type: 'single',
          editableKeys,
          onSave: async (rowKey, data, row) => {
            const themeData = {
              name: data.name,
              display_name: data.display_name,
              author: data.author,
              version: data.version,
              description: data.description,
              preview: data.preview,
              css: data.css,
              js: data.js,
            };
            ThemeApi.update(data.id, themeData).then(
              () => message.success('保存成功')
            ).catch((err) => {
              message.error('保存失败：' + err.message);
            });
          },
          onChange: setEditableKeys,
          actionRender: (row, config, defaultDom) => [defaultDom.save, defaultDom.cancel]
        }}
        recordCreatorProps={false}
        pagination={false}
        loading={loading}
        style={{
          paddingTop: '20px'
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}

export default Theme;