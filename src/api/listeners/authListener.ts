import type { AppStartListening } from "@api/listenerMiddleware";
import type { AuthResponse } from "@api/slices/authSlice";
import authSlice from "@api/slices/authSlice";
import { authUser, logoutUser } from "@redux/auth";
import type { AppDispatch, RootState } from "@redux/store";
import { isAnyOf } from "@reduxjs/toolkit";
import type { ListenerEffectAPI } from "@reduxjs/toolkit";
import socket, {
  syncSocketAuthorizationFromStorage,
} from "@utils/socket/socket";

export const handleAuthSuccess = (
  response: AuthResponse,
  api: ListenerEffectAPI<RootState, AppDispatch>,
) => {
  localStorage.setItem("token", response.accessToken);
  api.dispatch(authUser(response.user));
  syncSocketAuthorizationFromStorage();
  socket.connect();
};

export const addAuthListeners = (startAppListening: AppStartListening) => {
  // LOGIN / SIGNUP / GOOGLE SUCCESS
  startAppListening({
    matcher: isAnyOf(
      authSlice.endpoints.login.matchFulfilled,
      authSlice.endpoints.register.matchFulfilled,
      authSlice.endpoints.googleLogin.matchFulfilled,
    ),
    effect: async (action, api) => {
      handleAuthSuccess(action.payload as AuthResponse, api);
    },
  });

  // LOGOUT SUCCESS
  startAppListening({
    matcher: authSlice.endpoints.logout.matchFulfilled,
    effect: async (_action, api) => {
      localStorage.removeItem("token");
      api.dispatch(logoutUser());
      socket.disconnect();
    },
  });

  // REFRESH SUCCESS / FAILURE
  startAppListening({
    matcher: authSlice.endpoints.refresh.matchFulfilled,
    effect: async (action, api) => {
      handleAuthSuccess(action.payload as AuthResponse, api);
    },
  });

  startAppListening({
    matcher: authSlice.endpoints.refresh.matchRejected,
    effect: async (_action, api) => {
      localStorage.removeItem("token");
      api.dispatch(logoutUser());
    },
  });
};
