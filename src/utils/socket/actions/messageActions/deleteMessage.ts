import { updateMessages } from "@api/slices/helpers/MessagesManage";
import socket from "@utils/socket/socket";

const deleteMessage = (messageId: string, conversationId: string) => {
  updateMessages(conversationId, (messages) => {
    messages.items = messages.items.filter((msg) => msg.id !== messageId);
  });

  socket.emit("message:delete", { messageId });
};

export default deleteMessage;
