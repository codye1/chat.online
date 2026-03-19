import socket from "@utils/socket/socket";

const removeReaction = ({ messageId }: { messageId: string }) => {
  socket.emit("reaction:remove", { messageId });
};

export default removeReaction;
