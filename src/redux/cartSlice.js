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
  const exists = state.cartItems.find(
    (item) => item.productId === action.payload.productId
  );

  // ❌ same product dubara add mat karo
  if (exists) return;

  // ✅ naya (different) product add karo
  state.cartItems.push({
    productId: action.payload.productId,
    name: action.payload.name,
    price: action.payload.price,
    image: action.payload.image,
    quantity: 1,
  });
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
