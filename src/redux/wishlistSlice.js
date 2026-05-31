import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/* ================= LOAD WISHLIST ================= */
export const loadWishlist = createAsyncThunk(
  "wishlist/load",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;

      if (!token) {
        return rejectWithValue("User not authenticated");
      }

      const { data } = await axios.get(
        `${API_URL}/api/v1/user/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to load wishlist"
      );
    }
  }
);

/* ================= ADD ITEM ================= */
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;

      const { data } = await axios.post(
        `${API_URL}/api/v1/user/wishlist/${productId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to add wishlist item"
      );
    }
  }
);

/* ================= REMOVE ITEM ================= */
export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().user;

      const { data } = await axios.delete(
        `${API_URL}/api/v1/user/wishlist/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return data.wishlist;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to remove wishlist item"
      );
    }
  }
);

const wishlistSlice = createSlice({
  name: "wishlist",

  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    /* ========= Optimistic Add - Instant UI Update ========= */
    addWishlistLocal: (state, action) => {
      const exists = state.items.some(
        (item) => (item._id || item.product?._id) === action.payload._id
      );

      if (!exists) {
        // Add to beginning of array for immediate visibility
        state.items.unshift(action.payload);
      }
    },

    /* ========= Optimistic Remove - Instant UI Update ========= */
    removeWishlistLocal: (state, action) => {
      state.items = state.items.filter(
        (item) => (item._id || item.product?._id) !== action.payload
      );
    },

    /* ========= Sync Wishlist - For manual sync ========= */
    syncWishlist: (state, action) => {
      state.items = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder

      /* ===== LOAD ===== */
      .addCase(loadWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })

      .addCase(loadWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ===== ADD - Don't modify state here, just handle errors ===== */
      .addCase(addWishlistItem.pending, (state) => {
        state.error = null;
      })

      .addCase(addWishlistItem.fulfilled, (state, action) => {
        // Sync with server response (in case of any differences)
        state.items = action.payload || [];
      })

      .addCase(addWishlistItem.rejected, (state, action) => {
        state.error = action.payload;
      })

      /* ===== REMOVE - Don't modify state here, just handle errors ===== */
      .addCase(removeWishlistItem.pending, (state) => {
        state.error = null;
      })

      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        // Sync with server response
        state.items = action.payload || [];
      })

      .addCase(removeWishlistItem.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const {
  addWishlistLocal,
  removeWishlistLocal,
  syncWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;