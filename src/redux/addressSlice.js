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
    },
    selectAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },
  },
});

export const { setAddresses, selectAddress } = addressSlice.actions;
export default addressSlice.reducer;
