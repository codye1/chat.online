import Button from "@components/Button/Button";
import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import ParticipantsPicker from "@components/ParticipantsPicker/ParticipantsPicker";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import type { Conversation, UserSearchPreview } from "@utils/types";
import { useState } from "react";
import styles from "./AddParticipants.module.css";
import useGetConversationActions from "@hooks/useGetConversationActions";

interface IAddParticipants {
  conversation: Conversation;
  usersInConversation: UserSearchPreview[];
  canGoBack?: boolean;
}

const AddParticipants = ({
  conversation,
  usersInConversation,
  canGoBack,
}: IAddParticipants) => {
  const dispatch = useAppDispatch();
  const [selectedUsers, setSelectedUsers] = useState<UserSearchPreview[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const { handleAddParticipantToConversation } = useGetConversationActions({
    conversation,
  });

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
      closeButton
      backButton={canGoBack}
    >
      <MenuContent className={styles.content}>
        <h2>Add Participants</h2>
        <ParticipantsPicker
          selectedUsers={selectedUsers}
          usersInConversation={usersInConversation}
          onSelectedUsersChange={setSelectedUsers}
        />
        <div className={styles.buttons}>
          <Button onClick={() => dispatch(closeModal())}>Cancel</Button>
          <Button
            disabled={selectedUsers.length === 0 || isAdding}
            onClick={async () => {
              setIsAdding(true);
              await handleAddParticipantToConversation({
                participantIds: selectedUsers,
              });
              setIsAdding(false);
            }}
          >
            Add
          </Button>
        </div>
      </MenuContent>
    </Modal>
  );
};

export default AddParticipants;
export type { IAddParticipants };
