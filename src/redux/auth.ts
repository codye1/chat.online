import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@utils/definitions";

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
    },
    logoutUser(state) {
      state.isAuth = false;
      state.user = { email: "", nickname: "", id: "" };
    },
  },
});

export const { authUser, logoutUser } = authSlice.actions;

export default authSlice;
