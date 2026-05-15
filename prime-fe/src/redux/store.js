import { configureStore } from "@reduxjs/toolkit";
import mapReducer from "./mapState";
import authReducer from "./authState";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
  },
});
