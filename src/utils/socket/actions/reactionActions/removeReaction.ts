import socket from "@utils/socket/socket";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { addToast } from "@redux/global";
import store from "@redux/store";
import { current } from "immer";
import type { GroupedReactions, SocketError } from "@utils/types";

interface RemoveReactionParams {
  messageId: string;
  conversationId: string;
}

const removeReaction = ({
  messageId,
  conversationId,
}: RemoveReactionParams) => {
  const currentUser = store.getState().auth.user;
  let previousReactions: GroupedReactions | null = null;

  updateMessages(conversationId, (messages) => {
    if (!messages?.items) return;
    const message = messages.items.find((m) => m.id === messageId);
    if (!message) return;

    previousReactions = current(message.reactions) as GroupedReactions;

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

  if (!previousReactions) return;

  socket.emit(
    "reaction:remove",
    { messageId, throwError: true },
    errorHandler.bind(null, {
      conversationId,
      messageId,
      previousReactions,
    }),
  );
};

interface ErrorHandlerParams {
  conversationId: string;
  messageId: string;
  previousReactions: GroupedReactions;
}

const errorHandler = (
  { conversationId, messageId, previousReactions }: ErrorHandlerParams,
  data: { error: SocketError },
) => {
  const { error } = data;
  if (!error) return;

  updateMessages(conversationId, (messages) => {
    const message = messages.items.find((msg) => msg.id === messageId);
    if (!message) return;

    message.reactions = previousReactions;
  });

  store.dispatch(
    addToast({
      id: crypto.randomUUID(),
      type: "error",
      message: "Failed to remove reaction. Please try again.",
      from: "removeReaction",
      duration: 5000,
    }),
  );
};

export default removeReaction;
