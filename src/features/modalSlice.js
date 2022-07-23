import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selected: { value: 'viewer' },
};

export const modalSlice = createSlice({
  name: 'modal',
  initialState,
  reducers: {
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
});

export const { setSelected } = modalSlice.actions;
export default modalSlice.reducer;
