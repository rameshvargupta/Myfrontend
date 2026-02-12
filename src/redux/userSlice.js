

import { createSlice } from "@reduxjs/toolkit";

// ✅ Initial state
const initialState = {
  user: null,       // stores { _id, name, email, role } etc.
  token: null,      // access token (optional: can be kept in memory)
  isAuth: false,
  authChecked: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ✅ LOGIN
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuth = true;
      state.authChecked = true;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    // ✅ PROFILE UPDATE (NEW REDUCER)
    updateUser: (state, action) => {
      state.user = action.payload;  // only update user
      localStorage.setItem("user", JSON.stringify(action.payload));
    },

    // ✅ LOGOUT
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.authChecked = true;

      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    // ✅ LOAD FROM STORAGE
    loadUserFromStorage: (state) => {
      const userData = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (userData && token) {
        state.user = JSON.parse(userData);
        state.token = token;
        state.isAuth = true;
      }

      state.authChecked = true;
    },
  },
});


export const { setUser, updateUser, logoutUser, loadUserFromStorage } =
  userSlice.actions;

export default userSlice.reducer;