import { updateMessages } from "@api/slices/helpers/MessagesManage";
import store, { type RootState } from "@redux/store";
import type { Reaction, UserPreview } from "@utils/types";

interface NewReactionData {
  conversationId: string;
  messageId: string;
  newReaction: Reaction & { user: UserPreview };
  prevReaction?: Reaction & { user: UserPreview };
}

const onNewReaction = (data: NewReactionData) => {
  const { conversationId, messageId, newReaction, prevReaction } = data;

  const { getState } = store;
  updateMessages(conversationId, (messages) => {
    if (messages && messages.items) {
      const message = messages.items.find((m) => m.id === messageId);

      if (message) {
        if (prevReaction) {
          const prevReactionGroup = message.reactions[prevReaction.content];

          if (prevReactionGroup) {
            prevReactionGroup.users = prevReactionGroup.users.filter(
              (u) => u.id !== prevReaction.user.id,
            );
            prevReactionGroup.count -= 1;

            if (prevReactionGroup.count <= 0) {
              delete message.reactions[prevReaction.content];
            }
            const state = getState() as RootState;
            if (prevReaction.user.id === state.auth.user.id) {
              prevReactionGroup.isActive = false;
            }
          }
        }

        if (!message.reactions[newReaction.content]) {
          message.reactions[newReaction.content] = {
            count: 0,
            users: [],
            isActive: false,
          };
        }

        message.reactions[newReaction.content].count += 1;

        message.reactions[newReaction.content].users.push(newReaction.user);

        const state = getState() as RootState;
        if (newReaction.user.id === state.auth.user.id) {
          message.reactions[newReaction.content].isActive = true;
        }
      }
    }
  });
};
interface RemoveReactionData {
  conversationId: string;
  messageId: string;
  removedReaction: Reaction & { user: UserPreview };
}

const onRemoveReaction = (data: RemoveReactionData) => {
  const { conversationId, messageId, removedReaction } = data;
  const { getState } = store;

  updateMessages(conversationId, (messages) => {
    if (messages && messages.items) {
      const message = messages.items.find((m) => m.id === messageId);
      if (message) {
        const removedReactionGroup = message.reactions[removedReaction.content];

        if (removedReactionGroup) {
          removedReactionGroup.users = removedReactionGroup.users.filter(
            (u) => u.id !== removedReaction.user.id,
          );
          removedReactionGroup.count -= 1;
          if (removedReactionGroup.count <= 0) {
            delete message.reactions[removedReaction.content];
          }

          const state = getState() as RootState;
          if (removedReaction.user.id === state.auth.user.id) {
            removedReactionGroup.isActive = false;
          }
        }
      }
    }
  });
};

export { onNewReaction, onRemoveReaction };
