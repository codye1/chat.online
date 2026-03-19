import store from "@redux/store";
import chatSlice from "../Chat/chatSlice";
import type { MessagesResponse } from "../Chat/endpoints/messageEndpoints";

const updateMessages = (
  conversationId: string,
  updateFn: (messages: MessagesResponse) => void,
) => {
  store.dispatch(
    chatSlice.util.updateQueryData(
      "getMessages",
      { conversationId },
      (draft) => {
        if (draft) {
          updateFn(draft);
        }
      },
    ),
  );
};

export { updateMessages };
