import type { AppStartListening } from "@api/listenerMiddleware";
import userSlice from "@api/slices/userSlice";
import { updateUser } from "@redux/auth";

export const addUserListeners = (startAppListening: AppStartListening) => {
  // UPDATE SUCCESS
  startAppListening({
    matcher: userSlice.endpoints.updateUser.matchFulfilled,
    effect: async (action, api) => {
      api.dispatch(updateUser(action.payload));
    },
  });
};
