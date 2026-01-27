// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   user: null,
//   token: null,
//   isAuth: false,
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     setUser: (state, action) => {
//       state.user = action.payload.user;   // ✅ SIMPLE
//       state.token = action.payload.token;
//       state.isAuth = true;
//     },

//     logoutUser: (state) => {
//       state.user = null;
//       state.token = null;
//       state.isAuth = false;
//       localStorage.clear();
//     },
//   },
// });

// export const { setUser, logoutUser } = userSlice.actions;
// export default userSlice.reducer;


// frontend/src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

// ✅ Initial state
const initialState = {
  user: null,       // stores { _id, name, email, role } etc.
  token: null,      // access token (optional: can be kept in memory)
  isAuth: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // ================== LOGIN / SET USER ==================
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;         // store user info
      state.token = token;       // optional: store token in memory
      state.isAuth = true;

      // ✅ Persist only non-sensitive info
      localStorage.setItem("user", JSON.stringify(user));
    },

    // ================== LOGOUT ==================
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuth = false;

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
