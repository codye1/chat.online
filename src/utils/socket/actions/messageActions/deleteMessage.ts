import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { current } from "immer";
import { addToast } from "@redux/global";
import store from "@redux/store";
import socket from "@utils/socket/socket";
import type { Message, SocketError } from "@utils/types";

const deleteMessage = (messageId: string, conversationId: string) => {
  let optimisticDeletedMessage: Message | undefined;
  let deletedMessageIndex = -1;

  updateMessages(conversationId, (messages) => {
    deletedMessageIndex = messages.items.findIndex(
      (msg) => msg.id === messageId,
    );
    if (deletedMessageIndex === -1) return;

    optimisticDeletedMessage = current(
      messages.items[deletedMessageIndex],
    ) as Message;
    messages.items.splice(deletedMessageIndex, 1);
  });

  socket.emit(
    "message:delete",
    { messageId, throwError: true },
    errorHandler.bind(null, {
      conversationId,
      optimisticDeletedMessage,
      deletedMessageIndex,
    }),
  );
};

interface ErrorHandlerParams {
  conversationId: string;
  optimisticDeletedMessage?: Message;
  deletedMessageIndex: number;
}

const errorHandler = (
  {
    conversationId,
    optimisticDeletedMessage,
    deletedMessageIndex,
  }: ErrorHandlerParams,
  data: { error: SocketError },
) => {
  const { error } = data;
  if (error) {
    if (optimisticDeletedMessage) {
      updateMessages(conversationId, (messages) => {
        const exists = messages.items.some(
          (msg) => msg.id === optimisticDeletedMessage.id,
        );

        if (exists) return;

        const insertIndex = Math.max(
          0,
          Math.min(deletedMessageIndex, messages.items.length),
        );

        messages.items.splice(insertIndex, 0, optimisticDeletedMessage);
      });
    }

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
