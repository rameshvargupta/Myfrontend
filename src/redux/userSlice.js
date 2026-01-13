import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  isAuth: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ login / set user
    setUser: (state, action) => {
      state.user = action.payload.user;   // ✅ FIX
      state.token = action.payload.token; // ✅ FIX
      state.isAuth = true;
    },

    // 🚪 logout
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      localStorage.clear();
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
