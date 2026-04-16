import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { addToast } from "@redux/global";
import store from "@redux/store";
import socket from "@utils/socket/socket";
import type { MessageMedia, SocketError } from "@utils/types";

interface EditMessageParams {
  messageId: string;
  conversationId: string;
  newText: string;
  replaceMedia?: {
    oldMediaId?: string;
    newMedia: MessageMedia;
  };
}

const editMessage = ({
  messageId,
  conversationId,
  newText,
  replaceMedia,
}: EditMessageParams) => {
  let previousText: string | null = null;
  let previousMedia: MessageMedia[] | undefined;
  let previousStatus: "SENDING" | "SENT" | "FAILED" | null = null;

  updateMessages(conversationId, (messages) => {
    const message = messages.items.find((msg) => msg.id === messageId);
    if (message) {
      previousText = message.text;
      previousMedia = message.media?.map((media) => ({ ...media }));
      previousStatus = message.status;

      message.text = newText;
      message.status = "SENDING";

      if (replaceMedia) {
        if (message.media) {
          if (replaceMedia.oldMediaId) {
            const mediaIndex = message.media.findIndex(
              (m) => m.id === replaceMedia.oldMediaId,
            );
            if (mediaIndex !== -1) {
              message.media[mediaIndex] = replaceMedia.newMedia;
              return;
            }
          }
          message.media.push(replaceMedia.newMedia);
          return;
        }

        message.media = [replaceMedia.newMedia];
      }
    }
  });

  if (previousText === null || previousStatus === null) return;

  socket.emit(
    "message:edit",
    {
      messageId,
      conversationId,
      newText,
      replaceMedia,
      throwError: true,
    },
    errorHandler.bind(null, {
      conversationId,
      messageId,
      previousText,
      previousMedia,
      previousStatus,
    }),
  );
};

interface ErrorHandlerParams {
  conversationId: string;
  messageId: string;
  previousText: string;
  previousMedia?: MessageMedia[];
  previousStatus: "SENDING" | "SENT" | "FAILED";
}

const errorHandler = (
  {
    conversationId,
    messageId,
    previousText,
    previousMedia,
    previousStatus,
  }: ErrorHandlerParams,
  data: { error: SocketError },
) => {
  const { error } = data;
  if (error) {
    updateMessages(conversationId, (messages) => {
      const message = messages.items.find((msg) => msg.id === messageId);

      if (message) {
        message.text = previousText;
        message.media = previousMedia;
        message.status = previousStatus;
      }
    });

    store.dispatch(
      addToast({
        id: crypto.randomUUID(),
        type: "error",
        message: "Failed to edit the message. Please try again.",
        from: "editMessage",
        duration: 5000,
      }),
    );
  }
};

export default editMessage;
