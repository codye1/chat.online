import Modal from "@components/Modal/Modal";
import type { UserPreview } from "@utils/types";
import styles from "./OtherUserModal.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal, setConversation, setRecipient } from "@redux/global";
import getDisplayName from "@utils/helpers/getDisplayName";
import ViewHeader from "@components/ViewModalConstructor/ViewHeader/ViewHeader";
import ViewBody from "@components/ViewModalConstructor/ViewBody/ViewBody";
import ViewDetail from "@components/ViewModalConstructor/ViewDetail/ViewDetail";
import Avatar from "@components/Avatar/Avatar";
import { useGetUserQuery } from "@api/slices/userSlice";
import getOnlineStatus from "@utils/helpers/getOnlineStatus";
import ViewHeaderButton from "@components/ViewModalConstructor/ViewHeaderButton/ViewHeaderButton";
import messageIcon from "@assets/message.svg";
import { useGetConversationQuery } from "@api/slices/Chat/chatSlice";
import DirectConversationButtons from "./components/DirectConversationButtons/DirectConversationButtons";

interface IOtherUserModal {
  userPreview: UserPreview;
  canGoBack?: boolean;
}

const OtherUserModal = ({ userPreview, canGoBack }: IOtherUserModal) => {
  const dispatch = useAppDispatch();
  const { data } = useGetUserQuery(userPreview.id, {
    refetchOnMountOrArgChange: true,
  });

  const { data: conversation } = useGetConversationQuery({
    recipientId: null,
    conversationId: data?.directConversationId || null,
  });

  return (
    <Modal
      onClickOutside={() => dispatch(closeModal())}
      closeButton
      backButton={canGoBack}
    >
      <ViewHeader>
        <Avatar
          avatarUrl={userPreview.avatarUrl}
          width={"100px"}
          height={"100px"}
        />
        <div className={styles.headerInfo}>
          <h2>{getDisplayName(userPreview)}</h2>
          <h3>{getOnlineStatus(data?.user.lastSeenAt)}</h3>
        </div>
        <div className={styles.buttons}>
          <ViewHeaderButton
            title="Message"
            icon={messageIcon}
            onClick={() => {
              dispatch(closeModal());

              if (data?.directConversationId) {
                dispatch(
                  setConversation({
                    conversationId: data?.directConversationId,
                  }),
                );
              }

              if (!data?.directConversationId) {
                dispatch(setRecipient({ recipientId: userPreview.id }));
              }
            }}
          />
          {conversation && (
            <DirectConversationButtons conversation={conversation} />
          )}
        </div>
      </ViewHeader>
      <ViewBody className={styles.profileModalBody}>
        {data && data.user.biography && (
          <ViewDetail label="biography" value={data.user.biography} />
        )}
        <ViewDetail label="nickname" value={userPreview.nickname} link />
        {data && <ViewDetail label="email" value={data.user.email} link />}
      </ViewBody>
    </Modal>
  );
};

export default OtherUserModal;
export type { IOtherUserModal };
