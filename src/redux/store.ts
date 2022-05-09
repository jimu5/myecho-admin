import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

export const store = configureStore({
  reducer: combineReducers({}),
  devTools: process.env.NODE_ENV !== 'production',
});
