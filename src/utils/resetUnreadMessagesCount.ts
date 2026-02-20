import chatSlice from "@api/slices/chatSlice";
import store from "@redux/store";
const resetUnreadMessagesCount = (conversationId: string) => {
  store.dispatch(
    chatSlice.util.updateQueryData("getConversations", undefined, (draft) => {
      const convo = draft.find((c) => c.id === conversationId);
      if (convo) {
        convo.unreadMessages = 0;
      }
    }),
  );

  store.dispatch(
    chatSlice.util.updateQueryData(
      "getConversation",
      { conversationId, recipientId: null },
      (draft) => {
        draft.unreadMessages = 0;
      },
    ),
  );
};

export default resetUnreadMessagesCount;
