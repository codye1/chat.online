import { useDeleteConversationMutation } from "@api/slices/Chat/chatSlice";
import {
  addToFolder,
  deleteConversationFromState,
  removeFromFolder,
  updateConversationSettings,
  updatePinnedPositions,
} from "@api/slices/helpers/ConversationsManage";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";
import type { ConversationPreview } from "@utils/types";

import { type MouseEvent } from "react";

interface IUseGetContextActions {
  conversation: ConversationPreview;
  isPinned: boolean;
  nextPinPosition: number;
  activeFolderId: string;
}

const useGetContextActions = ({
  conversation,
  isPinned,
  nextPinPosition,
  activeFolderId,
}: IUseGetContextActions) => {
  const [deleteConversation] = useDeleteConversationMutation();
  const dispatch = useAppDispatch();
  const onPinClick = () => {
    const newPinnedPosition = isPinned ? null : nextPinPosition;
    updatePinnedPositions(activeFolderId, [
      {
        conversationId: conversation.id,
        newPinnedPosition,
      },
    ]);
  };

  const onArchiveClick = () => {
    updateConversationSettings(conversation.id, {
      isArchived: !conversation.isArchived,
    });
  };

  const onFolderClick = ({
    event,
    isInFolder,
    folderId,
  }: {
    event: MouseEvent<HTMLButtonElement>;
    isInFolder: boolean;
    folderId: string;
  }) => {
    event.stopPropagation();
    if (isInFolder) {
      removeFromFolder(conversation.id, folderId);
    } else {
      addToFolder(conversation.id, folderId);
    }
  };

  const onCreateFolderClick = () => {
    dispatch(
      openModal({
        type: "createFolder",
        selectedConversation: conversation.id,
      }),
    );
  };

  const onDeleteClick = async () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      document.body.classList.add("wait");
      await deleteConversation({ conversationId: conversation.id })
        .unwrap()
        .then(() => {
          deleteConversationFromState({
            conversationId: conversation.id,
          });
        })
        .catch((error) => {
          dispatch(
            openModal({
              type: "error",
              title: "Failed to Delete Conversation",
              message: error.data.error.message || "Unexpected error occurred.",
            }),
          );
        })
        .finally(() => {
          document.body.classList.remove("wait");
        });
    }
  };

  return {
    onArchiveClick,
    onFolderClick,
    onPinClick,
    onDeleteClick,
    onCreateFolderClick,
  };
};

export default useGetContextActions;
