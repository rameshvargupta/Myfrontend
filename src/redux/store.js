import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import cartReducer from "./cartSlice";
import addressReducer from "./addressSlice";

import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";

/* =========================
   PERSIST CONFIG
========================= */
const persistConfig = {
   key: "root",
   storage,
   whitelist: ["cart"], // 👈 sirf cart persist (addresses, cartItems)
};

/* =========================
   ROOT REDUCER
========================= */
const rootReducer = combineReducers({
   user: userReducer,
   cart: cartReducer,
   address: addressReducer,
});

/* =========================
   PERSISTED REDUCER
========================= */
const persistedReducer = persistReducer(persistConfig, rootReducer);

/* =========================
   STORE
========================= */
export const store = configureStore({
   reducer: persistedReducer,
   devTools: true,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: false, // 👈 redux-persist ke liye MUST
      }),
});

/* =========================
   PERSISTOR
========================= */
export const persistor = persistStore(store);
