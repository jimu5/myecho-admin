import { useSafeState } from "ahooks";
import { Space, message, Modal, Input } from "antd";
import React from "react";

import { SettingApi, settingModel } from "@/utils/apis/setting";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  okCallBack: Function | undefined
}

const ModalCreate: React.FC<Props> = ({ open, setOpen, okCallBack }) => {
  const [settingWrite, setSettingWrite] = useSafeState<settingModel>();

  const handleOk = () => {
    SettingApi.create(settingWrite!).then(
      () => {
        setSettingWrite(undefined);
        setOpen(false);
        message.success("创建成功");
        if (okCallBack) {
          okCallBack();
        }
      }
    )
  }

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
        <Input placeholder="设置 key" onChange={(e) => setSettingWrite({ ...settingWrite!, key: e.target.value })} />
        <Input placeholder="设置 type" onChange={(e) => setSettingWrite({ ...settingWrite!, type: e.target.value })} />
        <Input placeholder="设置 value" onChange={(e) => setSettingWrite({ ...settingWrite!, value: e.target.value })} />
      </Space>
    </Modal>
  )
}

export default ModalCreate;