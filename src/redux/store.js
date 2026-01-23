import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./userSlice"
import cartReducer from "./cartSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer
  },
  devTools: true
})

export default store
