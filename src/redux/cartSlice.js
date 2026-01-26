import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [], // 🛒 only cart data
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /* ================= ADD TO CART ================= */
    addToCart: (state, action) => {
      const item = state.cartItems.find(
        (i) => i.productId === action.payload.productId
      );

      if (item) {
        item.quantity += 1;
      } else {
        state.cartItems.push({
          ...action.payload,
          quantity: 1,
        });
      }
    },

    /* ================= UPDATE QTY ================= */
    updateQuantity: (state, action) => {
      const item = state.cartItems.find(
        (i) => i.productId === action.payload.productId
      );
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },

    /* ================= REMOVE ================= */
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.productId !== action.payload
      );
    },

    /* ================= CLEAR CART ================= */
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
