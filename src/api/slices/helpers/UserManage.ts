import store from "@redux/store";
import userSlice, { type GetUserResponse } from "../userSlice";

const updateGetUserCache = (
  userId: string,
  updateFn: (user: GetUserResponse) => void,
) => {
  store.dispatch(
    userSlice.util.updateQueryData("getUser", userId, (draft) => {
      updateFn(draft);
    }),
  );
};

export { updateGetUserCache };
