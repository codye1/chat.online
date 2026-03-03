import chatSlice from "@api/slices/chatSlice";
import store from "@redux/store";

const getMessage = ({
  messageId,
  conversationId,
}: {
  messageId: string;
  conversationId: string;
}) => {
  const state = store.getState();

  const messages =
    chatSlice.endpoints.getMessages.select({ conversationId })(state).data
      ?.items ?? [];
  return messages.find((m) => m.id === messageId) ?? null;
};

export default getMessage;
