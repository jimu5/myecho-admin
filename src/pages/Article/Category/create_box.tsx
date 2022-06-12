import React from 'react';
import { Select, Button, Input, notification } from 'antd';
import { useSafeState } from 'ahooks';

import { category, CategoryApi } from '@/utils/apis/category';

const { Option } = Select;

interface Props {
  data: category[];
  runAsync: Function
}

interface inputCategoryType {
  name: string;
  father_id: number;
}

const CreateBox: React.FC<Props> = ({ data, runAsync }) => {
  const [inputCategory, SetInputCategory] =
    useSafeState<inputCategoryType>(Object);

  const onClickCreate = () => {
    let createData = {
      name: inputCategory.name,
      father_id: inputCategory.father_id === 0? null : inputCategory.father_id,
    }
    CategoryApi.create(createData).then(() => {
      notification.success({ message: '添加成功' });
      runAsync();
    });
  }

  return (
    <div
      style={{
        marginBottom: '20px',
      }}>
      <p>父级分类: </p>
      <Select
        style={{
          width: '200px',
        }}
        onChange={(value: string) => {
          SetInputCategory({ ...inputCategory, father_id: Number(value) });
        }}>
        <Option key="0">无父分类</Option>
        {data
          .filter((item: category) => item.father_id === 0 || item.father_id === null)
          .map((item: category) => (
            <Option key={item.id}> {item.name} </Option>
          ))}
      </Select>
      <p>分类名</p>
      <Input
        style={{
          width: '200px',
          marginRight: '20px',
        }}
        onChange={(e) => {
          SetInputCategory({ ...inputCategory, name: e.target.value });
        }}></Input>
      <Button onClick={onClickCreate}>创建</Button>
    </div>
  );
};

export default CreateBox;
