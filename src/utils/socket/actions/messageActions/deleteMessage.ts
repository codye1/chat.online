import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { current } from "immer";
import { addToast } from "@redux/global";
import store from "@redux/store";
import socket from "@utils/socket/socket";
import type { Message, SocketError } from "@utils/types";

const deleteMessage = (messageId: string, conversationId: string) => {
  let deletedMessage: Message | null = null;
  let deletedMessageIndex = -1;

  updateMessages(conversationId, (messages) => {
    deletedMessageIndex = messages.items.findIndex(
      (msg) => msg.id === messageId,
    );
    if (deletedMessageIndex === -1) return;

    deletedMessage = current(messages.items[deletedMessageIndex]) as Message;
    messages.items.splice(deletedMessageIndex, 1);
  });

  if (!deletedMessage) return;

  socket.emit(
    "message:delete",
    { messageId, throwError: true },
    errorHandler.bind(null, {
      conversationId,
      deletedMessage,
      deletedMessageIndex,
    }),
  );
};

interface ErrorHandlerParams {
  conversationId: string;
  deletedMessage: Message;
  deletedMessageIndex: number;
}

const errorHandler = (
  { conversationId, deletedMessage, deletedMessageIndex }: ErrorHandlerParams,
  data: { error: SocketError },
) => {
  const { error } = data;
  if (error) {
    updateMessages(conversationId, (messages) => {
      const exists = messages.items.some((msg) => msg.id === deletedMessage.id);

      if (exists) return;

      const insertIndex = Math.max(
        0,
        Math.min(deletedMessageIndex, messages.items.length),
      );

      messages.items.splice(insertIndex, 0, deletedMessage);
    });

    store.dispatch(
      addToast({
        id: crypto.randomUUID(),
        type: "error",
        message: "Failed to delete the message. Please try again.",
        from: "deleteMessage",
        duration: 5000,
      }),
    );
  }
};

export default deleteMessage;
