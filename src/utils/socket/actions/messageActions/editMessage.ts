import { updateMessages } from "@api/slices/helpers/MessagesManage";
import socket from "@utils/socket/socket";
import type { MessageMedia } from "@utils/types";

const editMessage = ({
  messageId,
  conversationId,
  newText,
  replaceMedia,
}: {
  messageId: string;
  conversationId: string;
  newText: string;
  replaceMedia?: {
    oldMediaId?: string;
    newMedia: MessageMedia;
  };
}) => {
  updateMessages(conversationId, (messages) => {
    const message = messages.items.find((msg) => msg.id === messageId);
    if (message) {
      message.text = newText;
      if (replaceMedia) {
        if (message.media) {
          if (replaceMedia.oldMediaId) {
            const mediaIndex = message.media.findIndex(
              (m) => m.id === replaceMedia.oldMediaId,
            );
            if (mediaIndex !== -1) {
              message.media[mediaIndex] = replaceMedia.newMedia;
            }
          }

          message.media.push(replaceMedia.newMedia);
        } else {
          message.media = [replaceMedia.newMedia];
        }
      }
    }
  });

  socket.emit("message:edit", {
    messageId,
    conversationId,
    newText,
    replaceMedia,
  });
};

export default editMessage;
