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
  socket.emit("message:edit", {
    messageId,
    conversationId,
    newText,
    replaceMedia,
  });
};

export default editMessage;
