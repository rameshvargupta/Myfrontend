// redux/addressSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addresses: [],          // all saved addresses
  selectedAddress: null,  // currently selected
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    // set from backend (on refresh)
    setAddresses: (state, action) => {
      state.addresses = action.payload;
      state.selectedAddress = action.payload[0] || null;
    },

    // add new address
    addAddress: (state, action) => {
      state.addresses.push(action.payload);
      state.selectedAddress = action.payload;
    },

    // select existing address
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    clearAddresses: (state) => {
      state.addresses = [];
      state.selectedAddress = null;
    },
  },
});

export const {
  setAddresses,
  addAddress,
  selectAddress,
  clearAddresses,
} = addressSlice.actions;

export default addressSlice.reducer;
