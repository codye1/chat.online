import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import socket, { syncSocketAuthorizationFromStorage } from "@utils/socket";
import type { User } from "@utils/types";

interface AuthState {
  isAuth: boolean;
  user: User;
}

const initialState: AuthState = {
  isAuth: false,
  user: { email: "", nickname: "", id: "" },
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authUser(state, action: PayloadAction<User>) {
      state.isAuth = true;
      state.user = action.payload;
      console.log("CONNECT");
      // Sync token from localStorage before connecting
      syncSocketAuthorizationFromStorage();
      socket.connect();
    },
    logoutUser(state) {
      state.isAuth = false;
      state.user = { email: "", nickname: "", id: "" };
      socket.disconnect();
    },
  },
});

export const { authUser, logoutUser } = authSlice.actions;

export default authSlice;
