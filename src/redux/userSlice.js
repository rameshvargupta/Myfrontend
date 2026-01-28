
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
 setUser: (state, action) => {
  state.user = action.payload.user;
  state.token = action.payload.token;
  state.isAuth = !!action.payload.user;
  state.authChecked = true;
},

    // ================== LOGOUT ==================
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;
      state.authChecked = true;

      // ✅ Remove persisted info
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    // ================== SYNC FROM LOCALSTORAGE ==================
    loadUserFromStorage: (state) => {
      const userData = localStorage.getItem("user");
      if (userData) {
        state.user = JSON.parse(userData);
        state.isAuth = true;
      }
    },
  },
});

export const { setUser, logoutUser, loadUserFromStorage } = userSlice.actions;
export default userSlice.reducer;
