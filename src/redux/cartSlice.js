import { createSlice } from "@reduxjs/toolkit";

/* ================= HELPERS ================= */

// 🔹 Get cart by userId
const getCartFromStorage = (userId) => {
  if (!userId) return [];
  const data = localStorage.getItem(`cart_${userId}`);
  return data ? JSON.parse(data) : [];
};

// 🔹 Save cart by userId
const saveCartToStorage = (cartItems, userId) => {
  if (!userId) return;
  localStorage.setItem(
    `cart_${userId}`,
    JSON.stringify(cartItems)
  );
};

/* ================= INITIAL STATE ================= */

const initialState = {
  cartItems: [],
  userId: null,
};

/* ================= SLICE ================= */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {

    /* ================= LOAD USER CART ================= */
    loadUserCart: (state, action) => {
      const userId = action.payload;
      state.userId = userId;
      state.cartItems = getCartFromStorage(userId);
    },

    /* ================= ADD TO CART ================= */
    addToCart: (state, action) => {
      const exists = state.cartItems.find(
        (item) => item.productId === action.payload.productId
      );

      if (exists) return;

      state.cartItems.push({
        productId: action.payload.productId,
        name: action.payload.name,
        price: action.payload.price,
        image: action.payload.image,
        quantity: 1,
      });

      saveCartToStorage(state.cartItems, state.userId);
    },

    /* ================= UPDATE QTY ================= */
    updateQuantity: (state, action) => {
      const item = state.cartItems.find(
        (item) => item.productId === action.payload.productId
      );

      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
        saveCartToStorage(state.cartItems, state.userId);
      }
    },

    /* ================= REMOVE ================= */
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.productId !== action.payload
      );

      saveCartToStorage(state.cartItems, state.userId);
    },

    /* ================= CLEAR CART ================= */
    clearCart: (state) => {
      if (state.userId) {
        localStorage.removeItem(`cart_${state.userId}`);
      }
      state.cartItems = [];
      state.userId = null;
    },
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  loadUserCart,
} = cartSlice.actions;

export default cartSlice.reducer;