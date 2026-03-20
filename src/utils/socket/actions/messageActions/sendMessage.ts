import { addOptimisticMessage } from "@api/slices/helpers/MessagesManage";
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
  const tempId = addOptimisticMessage({
    conversationId,
    text,
    replyToMessageId,
    media,
  });

  // If the conversationId starts with "tempId", it means the conversation is not created yet and we should send the message with recipientId instead of conversationId
  const messageAtTempConversation = conversationId?.startsWith("tempId");

  if (messageAtTempConversation) {
    const recipientId = conversationId.split(":")[1];

    socket.emit("message:send", {
      text,
      replyToMessageId,
      recipientId,
      media,
      tempId,
    });
  }

  if (!messageAtTempConversation) {
    socket.emit("message:send", {
      conversationId,
      text,
      replyToMessageId,
      media,
      tempId,
    });
  }
};

export default sendMessage;
