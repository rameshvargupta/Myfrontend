import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [],
  addresses: [],          // 👈 MULTIPLE ADDRESSES
  selectedAddressId: null // 👈 SELECTED
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = state.cartItems.find(
        (i) => i.productId === action.payload.productId
      );
      if (item) {
        item.quantity += 1;
      } else {
        state.cartItems.push({ ...action.payload, quantity: 1 });
      }
    },

    updateQuantity: (state, action) => {
      const item = state.cartItems.find(
        (i) => i.productId === action.payload.productId
      );
      if (item) item.quantity = action.payload.quantity;
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.productId !== action.payload
      );
    },

    /* ================= ADDRESS ================= */

    addAddress: (state, action) => {
      state.addresses.push(action.payload);
      state.selectedAddressId = action.payload.id;
    },

    updateAddress: (state, action) => {
      const index = state.addresses.findIndex(
        (a) => a.id === action.payload.id
      );
      if (index !== -1) {
        state.addresses[index] = action.payload;
      }
    },

    deleteAddress: (state, action) => {
      state.addresses = state.addresses.filter(
        (a) => a.id !== action.payload
      );
      if (state.selectedAddressId === action.payload) {
        state.selectedAddressId = null;
      }
    },

    selectAddress: (state, action) => {
      state.selectedAddressId = action.payload;
    },

    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
