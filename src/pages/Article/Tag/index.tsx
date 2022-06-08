import React from 'react';
import { Tag, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRequest, useSafeState } from 'ahooks';

import { tag, TagApi } from '@/utils/apis/tag';

const TagIndex: React.FC = () => {
  const { data, loading } = useRequest(() => TagApi.getList());
  const [inputVisible, setInputVisible] = useSafeState(false);
  const [inputValue, setInputValue] = useSafeState('');


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    setInputVisible(false);
    setInputValue('');
  };

  const showInput = () => {
    setInputVisible(true);
  };


  return (
    <div>
      <h1>tags</h1>
      {data?.map((item: tag) => (
        <Tag key={item.id}>{item.name}</Tag>
      ))}
      {inputVisible && (
        <Input
          type="text"
          size="small"
          className="tag-input"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}
      {!inputVisible && (
        <Tag className="site-tag-plus" onClick={showInput}>
          <PlusOutlined /> New Tag
        </Tag>
      )}
    </div>
  );
};

export default TagIndex;
