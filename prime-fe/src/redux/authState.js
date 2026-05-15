import { createSlice } from "@reduxjs/toolkit";
import { loadStoredAuthUser, normalizeAuthUser } from "../utils/auth/authStorage";

const storedUser = loadStoredAuthUser();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoggedIn: Boolean(storedUser),
    user: storedUser,
  },
  reducers: {
    login(state, action) {
      const normalizedUser = normalizeAuthUser(action.payload);
      state.isLoggedIn = Boolean(normalizedUser);
      state.user = normalizedUser;
    },
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
