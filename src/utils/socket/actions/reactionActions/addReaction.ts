import socket from "@utils/socket/socket";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import store from "@redux/store";

const addReaction = ({
  messageId,
  content,
  conversationId,
}: {
  messageId: string;
  content: string;
  conversationId: string;
}) => {
  const currentUser = store.getState().auth.user;
  updateMessages(conversationId, (messages) => {
    if (!messages?.items) return;
    const index = messages.items.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    const message = messages.items[index];

    const prevEntry = Object.entries(message.reactions).find(
      ([, group]) => group.isActive,
    );
    if (prevEntry) {
      const [prevContent, prevGroup] = prevEntry;
      prevGroup.users = prevGroup.users.filter((u) => u.id !== currentUser.id);
      prevGroup.count -= 1;
      prevGroup.isActive = false;
      if (prevGroup.count <= 0) {
        delete message.reactions[prevContent];
      }
    }

    if (!message.reactions[content]) {
      message.reactions[content] = { count: 0, users: [], isActive: false };
    }

    message.reactions[content].count += 1;
    message.reactions[content].users.push(currentUser);
    message.reactions[content].isActive = true;
  });

  socket.emit("reaction:add", { messageId, content });
};

export default addReaction;
