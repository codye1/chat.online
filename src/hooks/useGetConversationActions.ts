import {
  useAddParticipantToConversationMutation,
  useDeleteConversationMutation,
  useLeaveConversationMutation,
  useRemoveUserFromConversationMutation,
} from "@api/slices/Chat/chatSlice";
import {
  addToFolder,
  deleteConversationFromState,
  removeFromFolder,
  updateConversation,
  updateConversationSettings,
  updatePinnedPositions,
} from "@api/slices/helpers/ConversationsManage";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, openModal, pushModal } from "@redux/global";
import getErorMessage from "@utils/helpers/getErrorMessage";
import type {
  ConversationPreview,
  UserPreviewAtConversation,
  UserSearchPreview,
} from "@utils/types";

import { type MouseEvent } from "react";

interface IUseGetConversationActions {
  conversation: ConversationPreview;
}

interface ITogglePinParams {
  isPinned: boolean;
  nextPinPosition: number;
  activeFolderId: string;
}

const useGetConversationActions = ({
  conversation,
}: IUseGetConversationActions) => {
  const [deleteConversation] = useDeleteConversationMutation();
  const [leaveConversation] = useLeaveConversationMutation();
  const [removeUserFromConversation] = useRemoveUserFromConversationMutation();
  const [addParticipantToConversation] =
    useAddParticipantToConversationMutation();

  const dispatch = useAppDispatch();
  const togglePin = ({
    isPinned,
    nextPinPosition,
    activeFolderId,
  }: ITogglePinParams) => {
    const newPinnedPosition = isPinned ? null : nextPinPosition;
    updatePinnedPositions(activeFolderId, [
      {
        conversationId: conversation.id,
        newPinnedPosition,
      },
    ]);
  };

  const toggleArchive = () => {
    updateConversationSettings(conversation.id, {
      isArchived: !conversation.isArchived,
    });
  };

  const toggleMute = () => {
    updateConversationSettings(conversation.id, {
      isMuted: !conversation.isMuted,
    });
  };

  const toggleFolder = ({
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

  const createFolder = () => {
    dispatch(
      openModal({
        type: "createFolder",
        selectedConversation: conversation.id,
      }),
    );
  };

  const handleDeleteConversation = async () => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      document.body.classList.add("wait");
      const result = await deleteConversation({
        conversationId: conversation.id,
      })
        .unwrap()
        .catch((error) => {
          dispatch(
            openModal({
              type: "error",
              title: "Failed to Delete Conversation",
              message: getErorMessage(error) || "Unexpected error occurred.",
            }),
          );

          return null;
        });

      if (!result) return;

      document.body.classList.remove("wait");
      deleteConversationFromState({
        conversationId: conversation.id,
      });
      dispatch(closeModal());
    }
  };

  const handleLeaveConversation = async () => {
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
          return null;
        });

      document.body.classList.remove("wait");
      if (result?.success) {
        deleteConversationFromState({
          conversationId: conversation.id,
        });
      }
    }
  };

  const handleAddParticipantToConversation = async ({
    participantIds,
  }: {
    participantIds: UserSearchPreview[];
  }) => {
    const result = await addParticipantToConversation({
      conversationId: conversation.id,
      participantIds: participantIds.map((p) => p.id),
    })
      .unwrap()
      .catch((error) => {
        dispatch(
          openModal({
            type: "error",
            title: "Failed to Add Participants",
            message: getErorMessage(error) || "Unexpected error occurred.",
          }),
        );

        return null;
      });

    if (result?.success) {
      updateConversation(conversation.id, (prev) => {
        if (prev.type === "GROUP") {
          prev.participants.push(
            ...participantIds.map((p) => {
              return {
                ...p,
                conversationId: conversation.id,
                role: "PARTICIPANT" as const,
              };
            }),
          );
        }
      });

      dispatch(closeModal());
    }
  };

  const handleRemoveParticipant = async (
    participant: UserPreviewAtConversation,
  ) => {
    const result = await removeUserFromConversation({
      conversationId: conversation.id,
      userId: participant.id,
    })
      .unwrap()
      .catch((err) => {
        dispatch(
          pushModal({
            type: "error",
            title: "Failed to remove user",
            message: getErorMessage(err) || "Something went wrong",
          }),
        );
      });

    if (result?.success) {
      updateConversation(conversation.id, (prev) => {
        if (prev.type === "GROUP") {
          prev.participants = prev.participants.filter(
            (p) => p.id !== participant.id,
          );
        }
      });
    }
  };

  return {
    toggleArchive,
    togglePin,
    createFolder,
    handleLeaveConversation,
    handleDeleteConversation,
    toggleMute,
    toggleFolder,
    handleAddParticipantToConversation,
    handleRemoveParticipant,
  };
};

export default useGetConversationActions;
