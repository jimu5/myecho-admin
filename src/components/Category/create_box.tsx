import React from 'react';
import { Select, Button, Input, notification } from 'antd';
import { useSafeState } from 'ahooks';

import { category, CategoryApi } from '@/utils/apis/category';

const { Option } = Select;

interface Props {
  data: category[];
  runAsync: Function;
  CreateMethod(arg: any): Promise<any>;
}

interface inputCategoryType {
  name: string;
  father_uid: string;
}

const CreateBox: React.FC<Props> = ({ data, runAsync, CreateMethod }) => {
  const [inputCategory, SetInputCategory] =
    useSafeState<inputCategoryType>(Object);

  const onClickCreate = () => {
    let createData = {
      name: inputCategory.name,
      father_uid: inputCategory.father_uid === ""? null : inputCategory.father_uid,
    }
    CreateMethod(createData).then(() => {
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
          SetInputCategory({ ...inputCategory, father_uid: value });
        }}>
        <Option key="0">无父分类</Option>
        {data
          .filter((item: category) => item.father_uid === "" || item.father_uid === null)
          .map((item: category) => (
            <Option key={item.uid}> {item.name} </Option>
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
