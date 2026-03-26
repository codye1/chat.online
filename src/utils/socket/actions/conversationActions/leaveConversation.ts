import socket from "@utils/socket/socket";

const leaveConversation = (conversationId: string[] | null) => {
  socket.emit("conversation:leave", { conversationId });
};

export default leaveConversation;
