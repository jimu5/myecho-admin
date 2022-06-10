import React from 'react';
import { Tag, Input, notification, Popconfirm } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';

import { tag, TagApi } from '@/utils/apis/tag';

const TagIndex: React.FC = () => {
  const { data, loading, run } = useRequest(() => TagApi.getList());
  const [inputVisible, setInputVisible] = useSafeState(false);
  const [inputValue, setInputValue] = useSafeState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    setInputVisible(false);
    setInputValue('');
    TagApi.create({ name: inputValue }).then(() => {
      notification.success({ message: '添加成功' });
      run();
    });
  };

  const showInput = () => {
    setInputVisible(true);
  };

  return (
    <div>
      <h1>tags</h1>
      {data?.map((item: tag) => (
        <Tag
          key={item.id}
          closable={true}
          closeIcon={
            <Popconfirm
              title="确定要删除吗"
              onConfirm={() => {
                TagApi.delete(item.id).then(() => {
                  notification.success({ message: '删除成功' });
                  run();
                });
              }}
              okButtonProps={{ loading: loading }}>
              <CloseOutlined />
            </Popconfirm>
          }
          onClose={(e) => {
            e.preventDefault();
          }}>
          {item.name}
        </Tag>
      ))}
      {inputVisible && (
        <Input
          type="text"
          size="small"
          className="tag-input"
          style={{
            width: 'auto',
          }}
          value={inputValue}
          onChange={handleInputChange}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> 添加新标签
        </Tag>
      )}
    </div>
  );
};

export default TagIndex;
