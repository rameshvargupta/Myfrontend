import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  appliedCoupon: localStorage.getItem("couponCode") || null,
  discount: Number(localStorage.getItem("couponDiscount")) || 0,
};

const couponSlice = createSlice({
  name: "coupon",
  initialState,
  reducers: {
    applyCouponRedux: (state, action) => {
      state.appliedCoupon = action.payload.code;
      state.discount = action.payload.discount;

      // ✅ SAVE
      localStorage.setItem("couponCode", action.payload.code);
      localStorage.setItem("couponDiscount", action.payload.discount);
    },

    removeCouponRedux: (state) => {
      state.appliedCoupon = null;
      state.discount = 0;

      // ✅ REMOVE
      localStorage.removeItem("couponCode");
      localStorage.removeItem("couponDiscount");
    },
  },
});

export const { applyCouponRedux, removeCouponRedux } = couponSlice.actions;
export default couponSlice.reducer;