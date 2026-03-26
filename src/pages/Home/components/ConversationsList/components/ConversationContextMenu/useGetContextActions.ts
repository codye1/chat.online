import {
  useDeleteConversationMutation,
  useLeaveConversationMutation,
} from "@api/slices/Chat/chatSlice";
import {
  addToFolder,
  deleteConversationFromState,
  removeFromFolder,
  updateConversationSettings,
  updatePinnedPositions,
} from "@api/slices/helpers/ConversationsManage";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";
import getErorMessage from "@utils/helpers/getErrorMessage";
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
  const [leaveConversation] = useLeaveConversationMutation();
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

  const onMuteClick = () => {
    updateConversationSettings(conversation.id, {
      isMuted: !conversation.isMuted,
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
        .catch((error) => {
          dispatch(
            openModal({
              type: "error",
              title: "Failed to Delete Conversation",
              message: getErorMessage(error) || "Unexpected error occurred.",
            }),
          );
        });
      document.body.classList.remove("wait");
      deleteConversationFromState({
        conversationId: conversation.id,
      });
    }
  };

  const onLeaveClick = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      document.body.classList.add("wait");
      const result = await leaveConversation({
        conversationId: conversation.id,
      })
        .unwrap()
        .catch((error) => {
          dispatch(
            openModal({
              type: "error",
              title: "Failed to Leave Conversation",
              message: getErorMessage(error) || "Unexpected error occurred.",
            }),
          );
        });
      document.body.classList.remove("wait");
      if (result?.success) {
        deleteConversationFromState({
          conversationId: conversation.id,
        });
      }
    }
  };
  return {
    onArchiveClick,
    onFolderClick,
    onPinClick,
    onDeleteClick,
    onCreateFolderClick,
    onMuteClick,
    onLeaveClick,
  };
};

export default useGetContextActions;
