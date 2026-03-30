import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import styles from "./CreateGroupModal.module.css";
import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import Button from "@components/Button/Button";
import { useState } from "react";
import { useCreateConversationMutation } from "@api/slices/Chat/chatSlice";
import type { UserSearchPreview } from "@utils/types";
import AvatarWithUploader from "../EditProfileModal/components/AvatarWithUploader/AvatarWithUploader";
import ParticipantsPicker from "@components/ParticipantsPicker/ParticipantsPicker";

const CreateGroupModal = () => {
  const dispatch = useAppDispatch();
  const [selectedUsers, setSelectedUsers] = useState<UserSearchPreview[]>([]);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [createConversation, { isLoading }] = useCreateConversationMutation();
  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
      closeButton
    >
      <MenuContent className={styles.content}>
        <h2>Create Group</h2>
        <div className={styles.inputsContainer}>
          <AvatarWithUploader
            onUpload={(result) => setUploadedImg(result.secure_url)}
            buttonClassName={styles.avatarUploaderButton}
            className={styles.avatarUploader}
            width={"75px"}
            height={"75px"}
            defaultAvatarUrl={uploadedImg}
            fullSizeUploader
          />

          <InputWithLabel
            label="Group name"
            name="conversationTitle"
            value={title}
            className={styles.titleInput}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <ParticipantsPicker
          selectedUsers={selectedUsers}
          onSelectedUsersChange={setSelectedUsers}
        />
        <div className={styles.buttons}>
          <Button>Cancel</Button>
          <Button
            disabled={
              title.trim().length === 0 ||
              selectedUsers.length === 0 ||
              uploadedImg === null ||
              isLoading
            }
            onClick={async () => {
              await createConversation({
                title,
                participantIds: selectedUsers.map((u) => u.id),
                avatarUrl: uploadedImg,
                type: "GROUP",
              });
              dispatch(closeModal());
            }}
            isLoading={isLoading}
          >
            Create
          </Button>
        </div>
      </MenuContent>
    </Modal>
  );
};

export default CreateGroupModal;
