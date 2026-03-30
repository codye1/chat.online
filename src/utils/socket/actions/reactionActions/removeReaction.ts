import socket from "@utils/socket/socket";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import store from "@redux/store";

const removeReaction = ({
  messageId,
  conversationId,
}: {
  messageId: string;
  conversationId: string;
}) => {
  const currentUser = store.getState().auth.user;

  updateMessages(conversationId, (messages) => {
    if (!messages?.items) return;
    const message = messages.items.find((m) => m.id === messageId);
    if (!message) return;

    const reactionContent = Object.keys(message.reactions).find((key) =>
      message.reactions[key].users.some((u) => u.id === currentUser.id),
    );

    if (reactionContent) {
      const group = message.reactions[reactionContent];
      group.users = group.users.filter((u) => u.id !== currentUser.id);
      group.count -= 1;
      group.isActive = false;
      if (group.count <= 0) {
        delete message.reactions[reactionContent];
      }
    }
  });

  socket.emit("reaction:remove", { messageId });
};

export default removeReaction;
