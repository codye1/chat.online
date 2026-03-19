import socket from "@utils/socket/socket";

const deleteMessage = (messageId: string) => {
  socket.emit("message:delete", { messageId });
};

export default deleteMessage;
