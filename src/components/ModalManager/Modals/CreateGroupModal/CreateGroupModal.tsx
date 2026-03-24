import MenuContent from "@components/MenuConstructor/MenuContent/MenuContent";
import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import styles from "./CreateGroupModal.module.css";
import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import Button from "@components/Button/Button";
import { useState } from "react";
import {
  useCreateConversationMutation,
  useSearchQuery,
} from "@api/slices/Chat/chatSlice";
import Avatar from "@components/Avatar/Avatar";
import type { UserSearchPreview } from "@utils/types";
import removeFromSelectedIcon from "@assets/close.svg";
import AvatarWithUploader from "../EditProfileModal/components/AvatarWithUploader/AvatarWithUploader";

const CreateGroupModal = () => {
  const dispatch = useAppDispatch();
  const [searchValue, setSearchValue] = useState("");
  const { data: searchResults } = useSearchQuery(
    { query: searchValue, type: "users" },
    { skip: searchValue.trim().length === 0, refetchOnMountOrArgChange: true },
  );
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
        <div className={styles.addParticipants}>
          <div className={styles.selectedUsers}>
            {selectedUsers.map((user) => (
              <div key={user.id} className={styles.selectedUser}>
                <Avatar
                  key={user.id}
                  avatarUrl={user.avatarUrl}
                  width={30}
                  height={30}
                />
                <span>{user.nickname}</span>
                <img
                  src={removeFromSelectedIcon}
                  alt="Remove"
                  className={styles.removeIcon}
                  onClick={() => {
                    setSelectedUsers((prev) =>
                      prev.filter((u) => u.id !== user.id),
                    );
                  }}
                />
              </div>
            ))}
          </div>
          <InputWithLabel
            label="Add participants"
            name="participants"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <div className={styles.searchResults}>
            {searchResults && searchResults.global.length > 0 ? (
              searchResults.global.map(
                (user) =>
                  user.type === "user" && (
                    <div
                      key={user.id}
                      className={styles.searchResult}
                      onClick={() => {
                        if (!selectedUsers.find((u) => u.id === user.id)) {
                          setSelectedUsers((prev) => [...prev, user]);
                        }
                      }}
                    >
                      <Avatar
                        avatarUrl={user.avatarUrl}
                        className={styles.avatar}
                        selected={!!selectedUsers.find((u) => u.id === user.id)}
                      />
                      <span>{user.nickname}</span>
                    </div>
                  ),
              )
            ) : (
              <p>No results</p>
            )}
          </div>
        </div>
        <div className={styles.buttons}>
          <Button>Cancel</Button>
          <Button
            disabled={title.trim().length === 0 || selectedUsers.length === 0}
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
