import type { AppStartListening } from "@api/listenerMiddleware";
import userSlice from "@api/slices/userSlice";
import { updateUser } from "@redux/auth";

export const addUserListeners = (startAppListening: AppStartListening) => {
  // UPDATE SUCCESS
  startAppListening({
    matcher: userSlice.endpoints.updateUser.matchFulfilled,
    effect: async (action, api) => {
      console.log(action.payload);

      api.dispatch(updateUser(action.payload)); // Assuming the response has a 'user' field with the updated user data
    },
  });
};
