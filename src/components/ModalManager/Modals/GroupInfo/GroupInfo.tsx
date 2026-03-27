import Avatar from "@components/Avatar/Avatar";
import Modal from "@components/Modal/Modal";
import ViewHeader from "@components/ViewModalConstructor/ViewHeader/ViewHeader";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { closeModal, pushModal, setConversation } from "@redux/global";
import type { GroupConversation } from "@utils/types";
import styles from "./GroupInfo.module.css";
import ViewBody from "@components/ViewModalConstructor/ViewBody/ViewBody";
import groupIcon from "@assets/group.svg";
import ListItem from "@components/ListItem/ListItem";
import ListItemInfo from "@components/ListItem/ListItemInfo";
import getOnlineStatus from "@utils/helpers/getOnlineStatus";
import {
  useGetConversationParticipantsMutation,
  useGetConversationQuery,
} from "@api/slices/Chat/chatSlice";
import { updateConversation } from "@api/slices/helpers/ConversationsManage";
import InfiniteScrolling from "@components/InfiniteScrolling/InfiniteScrolling";
import { useState } from "react";
import useGetConversationActions from "@hooks/useGetConversationActions";
import ViewHeaderButton from "@components/ViewModalConstructor/ViewHeaderButton/ViewHeaderButton";
import unmutedIcon from "@assets/unmuted.svg";
import mutedIcon from "@assets/muted.svg";
import deleteIcon from "@assets/trash.svg";
import leaveIcon from "@assets/leave.svg";
import messageIcon from "@assets/message.svg";
import addUserIcon from "@assets/addUser.svg";

interface IGroupInfo {
  initialConversation: GroupConversation;
}

const GroupInfo = ({ initialConversation }: IGroupInfo) => {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user.id);
  const [canLoadMoreParticipants, setCanLoadMoreParticipants] = useState(true);
  const [getConversationParticipants] =
    useGetConversationParticipantsMutation();
  const { data } = useGetConversationQuery({
    recipientId: null,
    conversationId: initialConversation.id,
  });

  const conversation = data?.type === "GROUP" ? data : initialConversation;

  const isUserOwner = conversation.ownerId === userId;

  const {
    toggleMute,
    handleDeleteConversation,
    handleLeaveConversation,
    handleRemoveParticipant,
  } = useGetConversationActions({
    conversation,
  });

  return (
    <Modal onClickOutside={() => dispatch(closeModal())} closeButton>
      <ViewHeader>
        <Avatar
          avatarUrl={conversation.avatarUrl}
          width={"100px"}
          height={"100px"}
        />
        <div className={styles.headerInfo}>
          <h2>{conversation.title}</h2>
          <h3>{conversation.participantsCount} participants</h3>
        </div>
        <div className={styles.headerButtons}>
          <ViewHeaderButton
            title="Message"
            icon={messageIcon}
            onClick={() => {
              dispatch(closeModal());
              dispatch(setConversation({ conversationId: conversation.id }));
            }}
          />
          <ViewHeaderButton
            title={conversation.isMuted ? "Unmute" : "Mute"}
            icon={conversation.isMuted ? mutedIcon : unmutedIcon}
            onClick={toggleMute}
          />

          {isUserOwner ? (
            <ViewHeaderButton
              title="Delete"
              icon={deleteIcon}
              onClick={handleDeleteConversation}
            />
          ) : (
            <ViewHeaderButton
              title="Leave"
              icon={leaveIcon}
              onClick={handleLeaveConversation}
            />
          )}
        </div>
      </ViewHeader>
      <ViewBody>
        <section className={styles.participantsSection}>
          <span className={styles.participantsHeader}>
            <img src={groupIcon} alt="Group Icon" />
            <h2>{conversation.participantsCount} participants</h2>

            <button
              className={styles.addButton}
              onClick={() =>
                dispatch(
                  pushModal({
                    type: "addParticipants",
                    conversation: conversation,
                    usersInConversation: conversation.participants.map((p) => ({
                      ...p,
                      type: "user",
                    })),
                  }),
                )
              }
            >
              <img src={addUserIcon} alt="Add User" />
            </button>
          </span>
          <InfiniteScrolling
            listId={`groupInfo-${conversation.id}-participants`}
            onBottomReached={async () => {
              setCanLoadMoreParticipants(false);

              const { data } = await getConversationParticipants({
                conversationId: conversation.id,
                cursor:
                  conversation.participants[
                    conversation.participants.length - 1
                  ].id,
                take: 10,
              });

              if (data) {
                updateConversation(conversation.id, (prev) => {
                  if (prev.type === "GROUP") {
                    prev.participants = [
                      ...prev.participants,
                      ...data.participants,
                    ];
                  }
                });
                setCanLoadMoreParticipants(data.hasMore);
              }
            }}
            hasMore={canLoadMoreParticipants}
            className={styles.participantsList}
            items={conversation.participants}
            renderItem={(participant) => (
              <ListItem
                key={participant.id}
                className={styles.participantItem}
                onClick={() => {
                  dispatch(
                    pushModal({ type: "otherUser", userPreview: participant }),
                  );
                }}
              >
                <Avatar
                  avatarUrl={participant.avatarUrl}
                  width={"40px"}
                  height={"40px"}
                />
                <ListItemInfo
                  title={participant.nickname}
                  subtitle={getOnlineStatus(participant.lastSeenAt)}
                />

                {participant.role !== "PARTICIPANT" && (
                  <span className={styles.roleBadge}>{participant.role}</span>
                )}

                {isUserOwner && participant.id !== userId && (
                  <button
                    className={styles.removeButton}
                    onClick={async (e) => {
                      e.stopPropagation();

                      if (conversation.participantsCount == 2) {
                        dispatch(
                          pushModal({
                            type: "warning",
                            title: "Removing last participant",
                            message:
                              "Removing this participant will delete the conversation. Do you want to proceed?",
                            canGoBack: true,
                            onContinue: async () => {
                              await handleRemoveParticipant(participant);
                              dispatch(closeModal());
                            },
                          }),
                        );
                        return;
                      }
                      handleRemoveParticipant(participant);
                    }}
                  >
                    Remove
                  </button>
                )}
              </ListItem>
            )}
          />
        </section>
      </ViewBody>
    </Modal>
  );
};

export default GroupInfo;
export type { IGroupInfo };
