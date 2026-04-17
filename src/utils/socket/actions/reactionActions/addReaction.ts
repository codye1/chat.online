import socket from "@utils/socket/socket";
import { updateMessages } from "@api/slices/helpers/MessagesManage";
import { addToast } from "@redux/global";
import store from "@redux/store";
import { current } from "immer";
import type { GroupedReactions, SocketError } from "@utils/types";

interface AddReactionParams {
  messageId: string;
  content: string;
  conversationId: string;
}

const addReaction = ({
  messageId,
  content,
  conversationId,
}: AddReactionParams) => {
  const currentUser = store.getState().auth.user;
  let previousReactions: GroupedReactions | undefined;

  updateMessages(conversationId, (messages) => {
    if (!messages?.items) return;
    const index = messages.items.findIndex((m) => m.id === messageId);
    if (index === -1) return;

    const message = messages.items[index];
    previousReactions = current(message.reactions) as GroupedReactions;

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

  socket.emit(
    "reaction:add",
    { messageId, content, throwError: true },
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
  previousReactions?: GroupedReactions;
}

const errorHandler = (
  { conversationId, messageId, previousReactions }: ErrorHandlerParams,
  data: { error: SocketError },
) => {
  const { error } = data;
  if (!error) return;

  if (previousReactions) {
    updateMessages(conversationId, (messages) => {
      const message = messages.items.find((msg) => msg.id === messageId);
      if (!message) return;

      message.reactions = previousReactions;
    });
  }

  store.dispatch(
    addToast({
      id: crypto.randomUUID(),
      type: "error",
      message: "Failed to add reaction. Please try again.",
      from: "addReaction",
      duration: 5000,
    }),
  );
};

export default addReaction;
