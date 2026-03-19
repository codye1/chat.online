import socket from "@utils/socket/socket";

const connectToConversation = (conversationId: string[] | null) => {
  socket.emit("conversation:join", { conversationId });
};

export default connectToConversation;
