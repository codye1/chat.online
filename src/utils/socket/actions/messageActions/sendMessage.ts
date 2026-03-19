import socket from "@utils/socket/socket";
import type { MessageMedia } from "@utils/types";

const sendMessage = ({
  conversationId,
  text,
  replyToMessageId,
  media,
}: {
  conversationId: string;
  text: string;
  replyToMessageId?: string | null;
  media?: MessageMedia[];
}) => {
  if (text.length === 0) return;
  const isTemp = conversationId?.startsWith("tempId");

  if (isTemp) {
    const recipientId = conversationId.split(":")[1];
    socket.emit("message:send", {
      text,
      replyToMessageId,
      recipientId,
      media,
    });
  }

  if (!isTemp) {
    socket.emit("message:send", {
      conversationId,
      text,
      replyToMessageId,
      media,
    });
  }
};

export default sendMessage;
