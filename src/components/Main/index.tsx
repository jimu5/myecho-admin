import React from 'react';
import { Route, Routes } from 'react-router-dom';

const Main: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
    </Routes>
  )
}

export default Main;