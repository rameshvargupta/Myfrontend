import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/* ================= LOAD ================= */
export const loadWishlist = createAsyncThunk(
  "wishlist/load",
  async (_, { getState }) => {
    const token = getState().user.token;

    const res = await fetch(
      "http://localhost:5000/api/v1/user/wishlist",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.wishlist;
  }
);

/* ================= ADD ================= */
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (productId, { getState }) => {
    const token = getState().user.token;

    const res = await fetch(
      `http://localhost:5000/api/v1/user/wishlist/${productId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.wishlist;
  }
);

/* ================= REMOVE ================= */
export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId, { getState }) => {
    const token = getState().user.token;

    const res = await fetch(
      `http://localhost:5000/api/v1/user/wishlist/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();
    return data.wishlist;
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default wishlistSlice.reducer;