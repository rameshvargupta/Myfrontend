import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    addresses: [],
    selectedAddress: null,
  },
  reducers: {
    setAddresses: (state, action) => {
      state.addresses = action.payload;

      // 🔥 Auto select default address
      if (action.payload.length > 0) {
        const defaultAddr =
          action.payload.find((addr) => addr.isDefault) ||
          action.payload[0];

        state.selectedAddress = defaultAddr;
      } else {
        state.selectedAddress = null;
      }
    },

    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    // ✅ Important for logout
    clearAddressState: (state) => {
      state.addresses = [];
      state.selectedAddress = null;
    },
  },
});

export const {
  setAddresses,
  selectAddress,
  clearAddressState,
} = addressSlice.actions;

export default addressSlice.reducer;