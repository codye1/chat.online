import socket from "@utils/socket/socket";

const addReaction = ({
  messageId,
  content,
}: {
  messageId: string;
  content: string;
}) => {
  socket.emit("reaction:add", { messageId, content });
};

export default addReaction;
