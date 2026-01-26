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
    setUser: (state, action) => {
      state.user = action.payload.user;   // ✅ SIMPLE
      state.token = action.payload.token;
      state.isAuth = true;
    },

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
