import React, { useCallback, useEffect } from "react";
import { useSafeState } from "ahooks";
import { Space, message, Modal, Input, TreeSelect } from "antd";

import { LinkAPI, Link } from "@/utils/apis/link";
import { category, CategoryApi } from "@/utils/apis/category";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  okCallBack: Function | undefined
}

const ModalCreate: React.FC<Props> = ({ open, setOpen, okCallBack }) => {
  const [LinkWrite, setLinkWrite] = useSafeState<Link>();
  const [categoryTree, setCategoryTree] = useSafeState([]);

  const handleOk = () => {
    LinkAPI.create(LinkWrite!).then(
      () => {
        setLinkWrite(undefined);
        setOpen(false);
        message.success("创建成功");
        if (okCallBack) {
          okCallBack();
        }
      }
    )
  }


  const buildTree = useCallback(
    (data: any) => {
      const tree: any = [];
      data.forEach((item: category) => {
        if (item.father_uid === "" || item.father_uid === null) {
          tree.push({
            title: item.name,
            key: item.uid,
            value: item.uid,
            children: [],
          });
        } else {
          const parent = tree.find((i: any) => i.key === item.father_uid);
          if (parent) {
            parent.children!.push({
              title: item.name,
              key: item.uid,
              value: item.uid,
              children: [],
            });
          }
        }
      });
      setCategoryTree(tree);
    },
    [setCategoryTree]
  );

  useEffect(() => {
    CategoryApi.getLinkList().then((data) => {
      buildTree(data)
    })
  }, [buildTree])

  return (
    <Modal
      title="创建新的设置"
      open={open}
      onOk={handleOk}
      onCancel={() => {
        setOpen(false);
      }}
    >
      <Space>
        <Input placeholder="链接名" onChange={(e) => setLinkWrite({ ...LinkWrite!, name: e.target.value })} />
        <Input placeholder="链接描述" onChange={(e) => setLinkWrite({ ...LinkWrite!, description: e.target.value })} />
        <Input placeholder="链接地址" onChange={(e) => setLinkWrite({ ...LinkWrite!, url: e.target.value })} />
        <Input placeholder="链接图像地址" onChange={(e) => setLinkWrite({ ...LinkWrite!, icon_url: e.target.value })} />
        <TreeSelect
          value={LinkWrite?.category_uid}
          treeData={categoryTree}
          style={{ width: '100%' }}
          onChange={(value) => {
            setLinkWrite({ ...LinkWrite!, category_uid: value });
          }}>
        </TreeSelect>
      </Space>
    </Modal>
  )
}

export default ModalCreate;