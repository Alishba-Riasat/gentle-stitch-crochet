// frontend/src/redux/slices/cartNotificationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  open: false,
  product: null,
  quantity: 1,
};

const cartNotificationSlice = createSlice({
  name: 'cartNotification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.open = true;
      state.product = action.payload.product;
      state.quantity = action.payload.quantity;
    },
    hideNotification: (state) => {
      state.open = false;
    },
  },
});

export const { showNotification, hideNotification } = cartNotificationSlice.actions;
export default cartNotificationSlice.reducer;