import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentFileNum: 0,
  totalFilesNum: 0,
  currentFilesUpload: 0,
  totalFilesUpload: 0,
};

export const fileCounterSlice = createSlice({
  name: 'fileCounter',
  initialState,
  reducers: {
    setTotal: (state, action) => {
      state.totalFilesNum = action.payload;
    },
    increment: (state) => {
      state.currentFileNum += 1;
    },
    setTotalUploadFiles: (state, action) => {
      state.totalFilesUpload = action.payload;
    },
    incrementUploadFiles: (state) => {
      state.currentFilesUpload += 1;
    },
    reset: () => initialState,
  },
});

export const {
  setTotal,
  increment,
  reset,
  setTotalUploadFiles,
  incrementUploadFiles,
} = fileCounterSlice.actions;
export default fileCounterSlice.reducer;
