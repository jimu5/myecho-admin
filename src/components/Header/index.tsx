import React from "react";
import { Layout } from "antd";

const { Header } = Layout;

const Myheader: React.FC = () => {
  return (
    <Header style={{ background: "#fff", padding: 0 }} >
      <h1>Header</h1>
    </Header>
  );
}

export default Myheader;
